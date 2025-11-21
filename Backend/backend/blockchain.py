from web3 import Web3
import random

# ------------------------------
# CONFIGURATION
# ------------------------------

PROVIDER_URL = "http://127.0.0.1:8545"

PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
ACCOUNT_ADDRESS = Web3.to_checksum_address("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

CONTRACT_ADDRESS = Web3.to_checksum_address("0x5FbDB2315678afecb367f032d93F642f64180aa3")


# ------------------------------
# ABI
# ------------------------------

ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": False, "internalType": "string", "name": "batchId", "type": "string"},
            {"indexed": False, "internalType": "string", "name": "drug", "type": "string"},
            {"indexed": False, "internalType": "address", "name": "manufacturer", "type": "address"}
        ],
        "name": "BatchCreated",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": False, "internalType": "string", "name": "batchId", "type": "string"},
            {"indexed": False, "internalType": "address", "name": "pharmacy", "type": "address"}
        ],
        "name": "Received",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": False, "internalType": "string", "name": "batchId", "type": "string"},
            {"indexed": False, "internalType": "address", "name": "distributor", "type": "address"}
        ],
        "name": "Shipped",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": False, "internalType": "string", "name": "batchId", "type": "string"}
        ],
        "name": "Sold",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "string", "name": "", "type": "string"}],
        "name": "batches",
        "outputs": [
            {"internalType": "string", "name": "drugName", "type": "string"},
            {"internalType": "string", "name": "batchId", "type": "string"},
            {"internalType": "uint256", "name": "mfgDate", "type": "uint256"},
            {"internalType": "uint256", "name": "expDate", "type": "uint256"},
            {"internalType": "address", "name": "manufacturer", "type": "address"},
            {"internalType": "address", "name": "distributor", "type": "address"},
            {"internalType": "address", "name": "pharmacy", "type": "address"},
            {"internalType": "uint8", "name": "state", "type": "uint8"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "batchId", "type": "string"},
            {"internalType": "string", "name": "drugName", "type": "string"},
            {"internalType": "uint256", "name": "mfgDate", "type": "uint256"},
            {"internalType": "uint256", "name": "expDate", "type": "uint256"},
            {"internalType": "address", "name": "distributor", "type": "address"}
        ],
        "name": "createBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "batchId", "type": "string"}],
        "name": "getBatch",
        "outputs": [
            {
                "components": [
                    {"internalType": "string", "name": "drugName", "type": "string"},
                    {"internalType": "string", "name": "batchId", "type": "string"},
                    {"internalType": "uint256", "name": "mfgDate", "type": "uint256"},
                    {"internalType": "uint256", "name": "expDate", "type": "uint256"},
                    {"internalType": "address", "name": "manufacturer", "type": "address"},
                    {"internalType": "address", "name": "distributor", "type": "address"},
                    {"internalType": "address", "name": "pharmacy", "type": "address"},
                    {"internalType": "uint8", "name": "state", "type": "uint8"}
                ],
                "internalType": "struct SupplyChain.Batch",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {"inputs": [{"internalType": "string", "name": "batchId", "type": "string"}], "name": "markSold", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {
        "inputs": [
            {"internalType": "string", "name": "batchId", "type": "string"},
            {"internalType": "address", "name": "pharmacy", "type": "address"}
        ],
        "name": "receiveAtPharmacy",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {"inputs": [{"internalType": "string", "name": "batchId", "type": "string"}], "name": "ship", "outputs": [], "stateMutability": "nonpayable", "type": "function"}
]



# ------------------------------
# BLOCKCHAIN CLASS
# ------------------------------

class PharmaBlockchain:

    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(PROVIDER_URL))

        if not self.w3.is_connected():
            raise Exception("❌ Could not connect to blockchain.")

        self.account = ACCOUNT_ADDRESS
        self.private_key = PRIVATE_KEY

        self.contract = self.w3.eth.contract(
            address=CONTRACT_ADDRESS,
            abi=ABI
        )

        print("🔗 Connected to blockchain.")
        print(f"📌 Using account: {self.account}")
        print(f"📌 Contract address: {CONTRACT_ADDRESS}")


    # ------------------------------
    # SIGN + SEND TX
    # ------------------------------

    def send_tx(self, tx):
        tx["gas"] = 3000000
        tx["nonce"] = self.w3.eth.get_transaction_count(self.account)

        signed = self.w3.eth.account.sign_transaction(
            tx, private_key=self.private_key
        )

        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return tx_hash.hex(), receipt


    # ------------------------------
    # CREATE BATCH
    # ------------------------------

    def create_batch(self, batchId, drug, mfg, exp, distributor):
        tx = self.contract.functions.createBatch(
            batchId, drug, mfg, exp, distributor
        ).build_transaction({
            "from": self.account,
            "gas": 3000000
        })

        return self.send_tx(tx)


    # ------------------------------
    # SHIP BATCH
    # ------------------------------

    def ship(self, batchId):
        tx = self.contract.functions.ship(batchId).build_transaction({
            "from": self.account,
            "gas": 3000000
        })
        return self.send_tx(tx)


    # ------------------------------
    # RECEIVE AT PHARMACY
    # ------------------------------

    def receive_at_pharmacy(self, batchId, pharmacy):
        tx = self.contract.functions.receiveAtPharmacy(batchId, pharmacy).build_transaction({
            "from": self.account,
            "gas": 3000000
        })
        return self.send_tx(tx)


    # ------------------------------
    # MARK AS SOLD
    # ------------------------------

    def mark_sold(self, batchId):
        tx = self.contract.functions.markSold(batchId).build_transaction({
            "from": self.account,
            "gas": 3000000
        })
        return self.send_tx(tx)


    # ------------------------------
    # GET BATCH
    # ------------------------------

    def get_batch(self, batchId):
        try:
            return self.contract.functions.getBatch(batchId).call()
        except Exception as e:
            return {"exists": False, "error": str(e)}



# ------------------------------
# TEST SEQUENCE
# ------------------------------

if __name__ == "__main__":
    bc = PharmaBlockchain()

    test_id = "BATCH_TEST_" + str(random.randint(10000, 99999))

    print("\n🧪 Running end-to-end test: createBatch -> getBatch")
    print(f"Creating batch: {test_id}")

    tx_hash, receipt = bc.create_batch(
        test_id, "Dolo-650", 1700000000, 1800000000, bc.account
    )

    print("CreateBatch TX ->", tx_hash)

    print("\nReading batch back...")
    print(bc.get_batch(test_id))
