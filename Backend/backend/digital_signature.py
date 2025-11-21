from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.exceptions import InvalidSignature
import base64
import json
import os

class DigitalSignatureManager:
    def __init__(self):
        self.private_key = None
        self.public_key = None
        self.load_or_generate_keys()

    def load_or_generate_keys(self):
        try:
            with open("keys/manufacturer_private.pem", "rb") as f:
                self.private_key = serialization.load_pem_private_key(
                    f.read(),
                    password=None
                )
            with open("keys/manufacturer_public.pem", "rb") as f:
                self.public_key = serialization.load_pem_public_key(f.read())
        except FileNotFoundError:
            self.generate_keys()
            self.save_keys()

    def generate_keys(self):
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        self.public_key = self.private_key.public_key()

    def save_keys(self):
        os.makedirs("keys", exist_ok=True)
        
        private_pem = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        with open("keys/manufacturer_private.pem", "wb") as f:
            f.write(private_pem)

        public_pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        with open("keys/manufacturer_public.pem", "wb") as f:
            f.write(public_pem)

    def sign_medicine_data(self, medicine_data):
        data_str = json.dumps(medicine_data, sort_keys=True)
        signature = self.private_key.sign(
            data_str.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return base64.b64encode(signature).decode('utf-8')

    def verify_signature(self, medicine_data, signature_b64):
        try:
            data_str = json.dumps(medicine_data, sort_keys=True)
            signature = base64.b64decode(signature_b64)
            
            self.public_key.verify(
                signature,
                data_str.encode('utf-8'),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except InvalidSignature:
            return False
        except Exception as e:
            print(f"Signature verification error: {e}")
            return False

    def get_public_key_pem(self):
        return self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')