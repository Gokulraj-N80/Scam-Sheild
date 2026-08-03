import sys
import requests

def test_whatsapp_webhook():
    sys.stdout.reconfigure(encoding='utf-8')
    url = "http://127.0.0.1:8000/api/whatsapp/webhook"
    
    # 1. Test scanning a suspicious phishing/scam message
    print("Testing suspicious scam message...")
    scam_payload = {
        "Body": "URGENT: Your account has been suspended! Please login to http://scam-bank-login.com to verify your credentials now or your card will be permanently blocked.",
        "From": "whatsapp:+14155238886"
    }
    
    try:
        response = requests.post(url, data=scam_payload)
        print(f"Status Code: {response.status_code}")
        print(f"Content Type: {response.headers.get('Content-Type')}")
        print("Response Body:")
        print(response.text)
        print("-" * 50)
    except requests.exceptions.ConnectionError:
        print("Could not connect to server. Make sure your FastAPI backend is running on port 8000 (run python run.py)")
        sys.exit(1)

    # 2. Test scanning a safe message
    print("Testing safe friendly message...")
    safe_payload = {
        "Body": "Hey, are we still meeting up for coffee at 3 PM today? Let me know if you need to reschedule.",
        "From": "whatsapp:+14155238886"
    }
    
    response = requests.post(url, data=safe_payload)
    print(f"Status Code: {response.status_code}")
    print(f"Content Type: {response.headers.get('Content-Type')}")
    print("Response Body:")
    print(response.text)
    print("=" * 50)

if __name__ == "__main__":
    test_whatsapp_webhook()
