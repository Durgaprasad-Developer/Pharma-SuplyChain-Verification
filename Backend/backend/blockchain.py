from web3 import Web3
import json
import os
from dotenv import load_dotenv
import time

load_dotenv()

class PharmaBlockchain:
    def __init__(self):
        # ---------- RPC ----------
        INFURA_RPC = os.getenv("RPC_URL")
        if not INFURA_RPC:
            raise Exception("❌ RPC_URL missing in .env")

        self.w3 = Web3(Web3.HTTPProvider(INFURA_RPC, request_kwargs={"timeout": 30}))

        if not self.w3.is_connected():
            raise Exception("❌ Could not connect to Polygon Amoy Testnet")

        print("✅ Connected to:", INFURA_RPC)

        # ---------- PRIVATE KEY ----------
        self.private_key = os.getenv("PRIVATE_KEY")
        if not self.private_key:
            raise Exception("❌ PRIVATE_KEY missing in .env")

        if not self.private_key.startswith("0x"):
            self.private_key = "0x" + self.private_key

        self.account = self.w3.eth.account.from_key(self.private_key).address
        print("🔐 Wallet:", self.account)

        # ---------- ABI ----------
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        ABI_PATH = os.path.join(BASE_DIR, "deployed_contract.json")

        if not os.path.exists(ABI_PATH):
            raise Exception(f"❌ ABI file not found at: {ABI_PATH}")

        with open(ABI_PATH, "r") as f:
            data = json.load(f)
            abi = data["abi"]

        # ---------- Contract Address ----------
        self.contract_address = "0xe1E0baB5eF4B912865232a9801680550D80F72aa"

        self.contract = self.w3.eth.contract(
            address=self.w3.to_checksum_address(self.contract_address),
            abi=abi
        )
        print("🏗 Contract Loaded:", self.contract_address)

        # Amoy Testnet chain id
        self.chain_id = 80002

    # ---------- Send Transaction ----------
    def send_tx(self, fn):
        try:
            nonce = self.w3.eth.get_transaction_count(self.account, "pending")

            tx = fn.build_transaction({
                "from": self.account,
                "nonce": nonce,
                "gas": 500000,
                "maxFeePerGas": self.w3.to_wei("70", "gwei"),
                "maxPriorityFeePerGas": self.w3.to_wei("30", "gwei"),
                "chainId": self.chain_id,
            })

            signed = self.w3.eth.account.sign_transaction(tx, self.private_key)

            raw_tx = (
                signed.rawTransaction
                if hasattr(signed, "rawTransaction")
                else signed.raw_transaction
            )

            tx_hash = self.w3.eth.send_raw_transaction(raw_tx)
            tx_hash_hex = self.w3.to_hex(tx_hash)

            print("📡 Tx Sent:", tx_hash_hex)
            return tx_hash_hex, True

        except Exception as e:
            print("❌ Blockchain TX Error:", e)
            return None, False

    # ---------- Contract Functions ----------
    def create_batch(self, batchId, drug, mfg, exp, distributor):
        return self.send_tx(
            self.contract.functions.createBatch(batchId, drug, mfg, exp, distributor)
        )

    def ship(self, batchId):
        return self.send_tx(
            self.contract.functions.ship(batchId)
        )

    def receive_at_pharmacy(self, batchId, pharmacy):
        return self.send_tx(
            self.contract.functions.receiveAtPharmacy(batchId, pharmacy)
        )

    def get_batch(self, batchId):
        return self.contract.functions.getBatch(batchId).call()
