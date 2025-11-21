# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os

# Local modules (these must exist in the same folder)
from digital_signature import DigitalSignatureManager
from qrcode_gen import QRCodeGenerator
from blockchain import PharmaBlockchain

# --------------------------
# FLASK INITIALIZATION
# --------------------------
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config["SECRET_KEY"] = "pharma-backend-secret-2024"
app.config["DEBUG"] = True

# --------------------------
# COMPONENTS
# --------------------------
signature_manager = DigitalSignatureManager()
qr_generator = QRCodeGenerator()
blockchain = PharmaBlockchain()

# In-memory "database"
medicine_records = {}

# --------------------------
# HELPERS
# --------------------------
def parse_onchain_batch(raw):
    """Convert blockchain tuple into a clean dict."""
    if not raw:
        return None

    # ABI may return tuple/list-like or dict-like depending on web3 version.
    if isinstance(raw, (list, tuple)) and len(raw) >= 8:
        return {
            "drugName": raw[0],
            "batchId": raw[1],
            "mfgDate": int(raw[2]) if raw[2] is not None else 0,
            "expDate": int(raw[3]) if raw[3] is not None else 0,
            "manufacturer": raw[4],
            "distributor": raw[5],
            "pharmacy": raw[6],
            "state": int(raw[7]) if raw[7] is not None else 0
        }

    if isinstance(raw, dict):
        return {
            "drugName": raw.get("drugName"),
            "batchId": raw.get("batchId"),
            "mfgDate": int(raw.get("mfgDate") or 0),
            "expDate": int(raw.get("expDate") or 0),
            "manufacturer": raw.get("manufacturer"),
            "distributor": raw.get("distributor"),
            "pharmacy": raw.get("pharmacy"),
            "state": int(raw.get("state") or 0)
        }

    return None

# --------------------------
# ROUTES
# --------------------------
@app.route("/")
def home():
    return jsonify({"message": "Pharma Supply Chain API Ready", "version": "1.0"})

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "total_medicines": len(medicine_records),
        "timestamp": datetime.now().isoformat()
    })

# -----------------------------------------------------
# 1. ADD MEDICINE
# -----------------------------------------------------
@app.route("/api/medicines", methods=["POST"])
def add_medicine():
    try:
        data = request.get_json(force=True)
        required = ["batch_no", "name", "manufacturer", "manufacture_date", "expiry_date", "scratch_card_no"]
        for f in required:
            if f not in data:
                return jsonify({"success": False, "error": f"Missing field: {f}"}), 400

        batch_no = data["batch_no"]
        if batch_no in medicine_records:
            return jsonify({"success": False, "error": "Batch already exists"}), 400

        # manufacture_date & expiry_date expected as timestamps (int). If frontend sends YYYY-MM-DD convert there.
        # Here we accept numeric timestamps; frontend must convert before sending.
        medicine_data = {
            "batch_no": batch_no,
            "name": data["name"],
            "manufacturer": data["manufacturer"],
            "manufacture_date": int(data["manufacture_date"]),
            "expiry_date": int(data["expiry_date"]),
            "current_owner": data["manufacturer"],
            "timestamp": datetime.now().isoformat()
        }

        # Sign the record
        digital_signature = signature_manager.sign_medicine_data(medicine_data)

        # Create the batch on-chain
        distributor_addr = data.get("distributor", blockchain.account)
        tx_hash, receipt = blockchain.create_batch(
            batchId=batch_no,
            drug=medicine_data["name"],
            mfg=medicine_data["manufacture_date"],
            exp=medicine_data["expiry_date"],
            distributor=distributor_addr
        )

        # Generate QR code (saves file and returns path,text)
        qr_path, qr_text = qr_generator.generate_medicine_qr(medicine_data, digital_signature)

        # Save locally (in-memory). Add transaction audit fields
        medicine_records[batch_no] = {
            **medicine_data,
            "digital_signature": digital_signature,
            "scratch_card_no": data["scratch_card_no"],
            "create_tx": tx_hash,
            "ship_tx": None,
            "receive_tx": None,
            "sold_tx": None,
            "qr_code_path": qr_path
        }

        return jsonify({
            "success": True,
            "message": "Medicine added successfully",
            "batch_no": batch_no,
            "digital_signature": digital_signature,
            "qr_code_path": qr_path,
            "blockchain_tx": tx_hash
        }), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# -----------------------------------------------------
# 2. VERIFY MEDICINE
# -----------------------------------------------------
@app.route("/api/medicines/verify", methods=["POST"])
def verify_medicine():
    try:
        data = request.get_json(force=True)
        batch_no = data.get("batch_no")
        scratch = data.get("scratch_card_no")

        if not batch_no or not scratch:
            return jsonify({"success": False, "error": "batch_no and scratch_card_no required"}), 400

        # Query on-chain
        try:
            raw_onchain = blockchain.get_batch(batch_no)
            onchain = parse_onchain_batch(raw_onchain)
        except Exception:
            onchain = None

        # Local check
        local = medicine_records.get(batch_no)
        local_exists = local is not None
        signature_ok = False
        scratch_ok = False

        if local_exists:
            signature_ok = signature_manager.verify_signature(
                {
                    "batch_no": local["batch_no"],
                    "name": local["name"],
                    "manufacturer": local["manufacturer"],
                    "manufacture_date": local["manufacture_date"],
                    "expiry_date": local["expiry_date"],
                    "current_owner": local["current_owner"],
                    "timestamp": local["timestamp"]
                },
                local["digital_signature"]
            )
            scratch_ok = (local["scratch_card_no"] == scratch)

        return jsonify({
            "success": True,
            "batch_no": batch_no,
            "onchain": onchain,
            "local_record_exists": local_exists,
            "digital_signature_valid": signature_ok,
            "scratch_card_match": scratch_ok,
            "verified_at": datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# -----------------------------------------------------
# 3. TRANSFER MEDICINE (ship -> receive)
# -----------------------------------------------------
@app.route("/api/medicines/transfer", methods=["POST"])
def transfer_medicine():
    try:
        data = request.get_json(force=True)
        batch_no = data.get("batch_no")
        to_owner = data.get("to_owner")
        scratch = data.get("scratch_card_no")

        if not all([batch_no, to_owner, scratch]):
            return jsonify({"success": False, "error": "batch_no, to_owner, scratch_card_no required"}), 400

        local = medicine_records.get(batch_no)
        if not local:
            return jsonify({"success": False, "error": "Batch not found"}), 404

        if local["scratch_card_no"] != scratch:
            return jsonify({"success": False, "error": "Scratch card mismatch"}), 400

        original_owner = local["current_owner"]

        # Sign the transfer data
        transfer_data = {
            "batch_no": batch_no,
            "from_owner": original_owner,
            "to_owner": to_owner,
            "timestamp": datetime.now().isoformat()
        }
        transfer_signature = signature_manager.sign_medicine_data(transfer_data)

        # Call blockchain ship() then receiveAtPharmacy()
        try:
            tx1_hash, _ = blockchain.ship(batch_no)
            tx2_hash, _ = blockchain.receive_at_pharmacy(batch_no, blockchain.account)
        except Exception as e:
            return jsonify({"success": False, "error": f"Blockchain transfer failed: {e}"}), 500

        # Update local owner only after chain success
        local["current_owner"] = to_owner
        local["ship_tx"] = tx1_hash
        local["receive_tx"] = tx2_hash

        return jsonify({
            "success": True,
            "message": "Ownership transferred",
            "batch_no": batch_no,
            "from": original_owner,
            "to": to_owner,
            "transfer_signature": transfer_signature,
            "tx_ship": tx1_hash,
            "tx_receive": tx2_hash
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# -----------------------------------------------------
# 4. DEBUG
# -----------------------------------------------------
@app.route("/api/debug/medicines", methods=["GET"])
def debug_medicines():
    return jsonify(medicine_records)

# --------------------------
# RUN SERVER
# --------------------------
if __name__ == "__main__":
    os.makedirs("static/qr_codes", exist_ok=True)
    os.makedirs("keys", exist_ok=True)
    print("🔗 Pharma Backend Running on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
