from fastapi import APIRouter, Form, Response, Request, Query
from typing import Optional
from app.services.nlp_service import preprocess_text
from app.services.gemini_service import analyze_message
from app.config import settings
import logging
import requests

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])
logger = logging.getLogger(__name__)

def send_meta_whatsapp_message(to: str, message_text: str, phone_number_id: str):
    # Use v20.0 or the configured version
    url = f"https://graph.facebook.com/v20.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message_text
        }
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        logger.info(f"Sent Meta WhatsApp message response status: {response.status_code}, content: {response.text}")
        return response
    except Exception as e:
        logger.error(f"Error sending Meta WhatsApp message: {e}")
        return None

def process_message_and_get_reply(body_text: str) -> str:
    if not body_text or not body_text.strip():
        return "❌ *ScamShield Error*: Message content cannot be empty. Please send a message/link to scan."
    
    try:
        # 1. Apply NLP preprocessing
        nlp_data = preprocess_text(body_text)
        
        # 2. Get AI Analysis from Gemini
        analysis = analyze_message(body_text, nlp_data)
        
        prediction = analysis.get("prediction", "Safe").upper()
        probability = int(analysis.get("probability", 0))
        reasons = analysis.get("reasons", [])
        recommendations = analysis.get("recommendations", [])
        
        # 3. Format response for WhatsApp (uses *bold* and _italics_ formatting)
        if prediction == "SCAM":
            verdict = "🚨 *SCAM DETECTED*"
        elif prediction == "SUSPICIOUS":
            verdict = "⚠️ *SUSPICIOUS MESSAGE*"
        else:
            verdict = "✅ *SAFE MESSAGE*"
            
        message_text = f"{verdict}\n\n"
        message_text += f"*Risk Probability:* {probability}%\n\n"
        
        if reasons:
            message_text += "*Key Indicators Found:*\n"
            for reason in reasons:
                message_text += f"• {reason}\n"
            message_text += "\n"
            
        if recommendations:
            message_text += "*Safety Recommendations:*\n"
            for rec in recommendations:
                message_text += f"👉 {rec}\n"
            message_text += "\n"
            
        message_text += "_Powered by ScamShield AI_"
        return message_text
        
    except Exception as e:
        logger.error(f"Error executing WhatsApp webhook scan: {e}")
        return "❌ *ScamShield Error*: We were unable to scan your message at this moment. Please try again later."

@router.get("/webhook")
def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    """
    Verification endpoint for Meta's WhatsApp Cloud API Webhook.
    """
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("WhatsApp Webhook verified successfully.")
        return Response(content=hub_challenge, media_type="text/plain")
    logger.warning("WhatsApp Webhook verification failed.")
    return Response(content="Verification failed", status_code=403)

@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    """
    Unified webhook for incoming WhatsApp messages.
    Supports:
    1. Twilio Webhook (POST Form-urlencoded)
    2. Meta WhatsApp Cloud API Webhook (POST JSON)
    """
    content_type = request.headers.get("content-type", "")
    
    if "application/json" in content_type:
        # 1. Meta WhatsApp Cloud API format (JSON)
        try:
            payload = await request.json()
            logger.info(f"Received Meta WhatsApp Cloud API webhook event: {payload}")
            
            # Check if this is a standard message status update or actual message
            entry = payload.get("entry", [])
            if not entry:
                return {"status": "no entry"}
                
            changes = entry[0].get("changes", [])
            if not changes:
                return {"status": "no changes"}
                
            value = changes[0].get("value", {})
            messages = value.get("messages", [])
            
            if not messages:
                # Could be a message status update (sent, delivered, read)
                return {"status": "no messages in payload"}
                
            msg = messages[0]
            from_number = msg.get("from")
            msg_type = msg.get("type")
            
            # We process text messages or messages containing text
            body_text = ""
            if msg_type == "text":
                body_text = msg.get("text", {}).get("body", "")
            elif msg_type == "interactive":
                # Handle interactive messages if any
                interactive_type = msg.get("interactive", {}).get("type")
                if interactive_type == "button_reply":
                    body_text = msg.get("interactive", {}).get("button_reply", {}).get("title", "")
            
            if body_text:
                # Process the message text
                reply_text = process_message_and_get_reply(body_text)
                
                # Send reply back using Meta's Cloud API
                phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID or value.get("metadata", {}).get("phone_number_id")
                if phone_number_id:
                    send_meta_whatsapp_message(from_number, reply_text, phone_number_id)
                else:
                    logger.error("No WhatsApp phone_number_id configured or found in payload metadata.")
            
            return {"status": "success"}
            
        except Exception as e:
            logger.error(f"Error parsing Meta WhatsApp webhook payload: {e}")
            return {"status": "error", "message": str(e)}
            
    else:
        # 2. Twilio format (Form URL Encoded)
        try:
            form_data = await request.form()
            body_text = form_data.get("Body", "")
            from_number = form_data.get("From", "")
            logger.info(f"Received Twilio WhatsApp scan request from {from_number}")
            
            reply_text = process_message_and_get_reply(body_text)
            
            # Return standard Twilio TwiML XML response
            twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{reply_text}</Message>
</Response>"""
            return Response(content=twiml_response, media_type="application/xml")
            
        except Exception as e:
            logger.error(f"Error parsing Twilio WhatsApp webhook payload: {e}")
            twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>❌ *ScamShield Error*: We were unable to scan your message at this moment. Please try again later.</Message>
</Response>"""
            return Response(content=twiml_response, media_type="application/xml")
