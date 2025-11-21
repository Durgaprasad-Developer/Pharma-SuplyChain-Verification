from dataclasses import dataclass

@dataclass
class Medicine:
    batch_no: str
    name: str
    manufacturer: str
    manufacture_date: str
    expiry_date: str
    scratch_card_no: str
    digital_signature: str
    current_owner: str
    timestamp: str