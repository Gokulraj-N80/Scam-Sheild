import os
from app.config import settings
from firebase_admin import credentials

try:
    private_key = settings.FIREBASE_PRIVATE_KEY.replace('\r\n', '\n').replace('\r', '\n').replace('\\n', '\n').strip('"')
    print("Private key length:", len(private_key))
    print("Start:", repr(private_key[:50]))
    print("End:", repr(private_key[-50:]))
    
    cred_dict = {
        "type": "service_account",
        "project_id": settings.FIREBASE_PROJECT_ID,
        "client_email": settings.FIREBASE_CLIENT_EMAIL,
        "private_key": private_key,
        "token_uri": "https://oauth2.googleapis.com/token",
    }
    cred = credentials.Certificate(cred_dict)
    print("Credential initialization succeeded!")
except Exception as e:
    print("FAILED:", e)
