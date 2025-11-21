import os

class Config:
    SECRET_KEY = 'pharma-backend-secret-2024'
    DEBUG = True
    QR_CODE_FOLDER = 'static/qr_codes'
    
    # Blockchain Configuration
    BLOCKCHAIN_PROVIDER = 'HTTP://127.0.0.1:7545'
    CONTRACT_ADDRESS = ''
    PRIVATE_KEY = ''
    CHAIN_ID = 1337