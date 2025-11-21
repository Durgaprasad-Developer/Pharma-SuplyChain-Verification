import qrcode
import os
from datetime import datetime
import json

class QRCodeGenerator:
    def __init__(self, base_path="static/qr_codes"):
        self.base_path = base_path
        os.makedirs(self.base_path, exist_ok=True)

    def generate_medicine_qr(self, medicine_data, signature):
        qr_data = {
            'batch_no': medicine_data['batch_no'],
            'name': medicine_data['name'],
            'manufacturer': medicine_data['manufacturer'],
            'digital_signature': signature,
            'timestamp': datetime.now().isoformat()
        }
        
        qr_json = json.dumps(qr_data)
        filename = f"medicine_{medicine_data['batch_no']}.png"
        
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
        qr.add_data(qr_json)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        filepath = os.path.join(self.base_path, filename)
        img.save(filepath)
        
        return filepath, qr_json