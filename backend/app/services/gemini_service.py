import json
import logging
from google import genai
from google.genai import types
from app.config import settings

logger = logging.getLogger(__name__)

# Create Gemini client if key is provided
_gemini_client = None
if settings.GEMINI_API_KEY:
    try:
        _gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        logger.info("Google Gemini client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Google Gemini client: {e}")

def analyze_message(original_text: str, nlp_data: dict) -> dict:
    """
    Sends preprocessed text and metadata to Gemini to analyze if it's a scam.
    If GEMINI_API_KEY is missing, falls back to a rule-based mock analysis.
    """
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.strip() == "" or _gemini_client is None:
        logger.warning("GEMINI_API_KEY is not configured. Running in Mock/Simulated AI mode.")
        return get_mock_analysis(original_text, nlp_data)

    prompt = f"""You are ScamShield, an advanced cybersecurity AI specialized in detecting scam messages, phishing attempts, spam, financial fraud, and social engineering attacks in WhatsApp, SMS, email, and social media communications.

Your task is to analyze the provided message and determine whether it is a scam or safe.

## SCAM PATTERNS TO DETECT

Check the message for the following scam indicator categories:

### 1. Impersonation & Authority spoofing
The sender pretends to be a trusted entity (bank, government, WhatsApp, company, family member, friend, or authority figure). Look for claims like "your bank", "WhatsApp support", "government agency", "from [CEO name]", or impersonating known contacts.

### 2. Urgency & Pressure
Messages that demand immediate action create panic: "act now", "limited time", "your account will be locked", "last chance", "immediately", "respond within hours", "do not delay", "final warning". These pressure Tactics prevent victims from thinking critically.

### 3. Emotional Manipulation
Messages exploit fear, greed, sympathy, or curiosity: fake emergencies from "family", lottery wins, unexpected inheritances, sympathy scams, romance bait, or shocking claims designed to override rational thinking.

### 4. Financial Lures
Requests for money, crypto investments, fake job offers promising high pay, "pay to unlock" offers, inheritance notifications, fake lotteries, investment schemes, or requests for payment via gift cards, crypto, wire transfer, Zelle, etc.

### 5. Credential & Data Theft
Requests for passwords, OTPs, verification codes, SSN, bank details, credit card numbers, login links, or asking the recipient to "verify" their account on a linked website.

### 6. Malicious Links & Attachments
URLs (especially shortened ones like bit.ly, tinyurl), download links, or attachments that install malware, phishing forms, or unauthorized access tools.

### 7. Tech Support Scams
Claims that your device is infected, compromised, or has a virus, directing you to call a fake support number, install remote access software, or visit a fraudulent website.

### 8. Romance & Relationship Scams
Building emotional connection to eventually request money, crypto, gift cards, or personal financial information. Common on dating apps and social media.

### 9. Government & Legal Threats
Messages claiming legal action, outstanding warrants, unpaid taxes, frozen accounts, or mandatory court appearances requiring immediate payment or personal info.

### 10. Fake Giveaway & Giveaway Bait
"Win a prize", "free iPhone", "claim your reward", requiring the user to click a link, pay a "processing fee", or share the message with contacts.

## ANALYSIS PROCESS

For each message, systematically check ALL of the above categories. For each category that matches, note the specific indicators found. Combine the evidence to determine the overall threat level.

Consider:
- The tone and language patterns
- Whether the message creates artificial urgency
- Whether it requests sensitive information or money
- Whether it contains suspicious links or attachments
- Whether the sender identity is unverifiable or spoofed
- Whether the offer seems too good to be true

## REQUIRED OUTPUT FORMAT

You MUST respond with a single valid JSON object with exactly these keys:

- "prediction": Either "Scam" or "Safe"
- "probability": An integer from 0 to 100 where 0 means definitely safe and 100 means definitely a scam
- "reasons": A list of 2-3 SHORT strings (max 8 words each) naming the scam type detected. Keep it simple, e.g. "Fake urgency to click a link", "Impersonates Google", "Suspicious third-party URL".
- "recommendations": A list of 2-3 SHORT strings (max 8 words each) telling the user what to do. e.g. "Do not click any links.", "Report as phishing.", "Verify via official website.".

Return ONLY the raw JSON object. Do not include markdown formatting, code blocks, or any explanatory text outside the JSON.

## MESSAGE TO ANALYZE

Original Message: "{original_text}"
Preprocessed Lemmas: "{nlp_data['cleaned_text']}"
Extracted Keywords: {nlp_data['keywords']}
Named Entities: {nlp_data['entities']}
"""

    try:
        response = _gemini_client.models.generate_content(
            model="gemini-1.5-flash",  # Google Gemini 1.5 Flash — fast, efficient LLM for scam analysis
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        result_json = response.text.strip()

        if result_json.startswith("```json"):
            result_json = result_json[7:]
        if result_json.endswith("```"):
            result_json = result_json[:-3]

        data = json.loads(result_json.strip())
        return data

    except Exception as e:
        logger.error(f"Gemini API analysis failed: {e}. Falling back to simulated analysis.")
        logger.warning("TIP: Check that GEMINI_API_KEY in your .env is a valid Google AI API key (starts with 'AIza' or 'AQ.').")
        return get_mock_analysis(original_text, nlp_data)

def get_mock_analysis(original_text: str, nlp_data: dict) -> dict:
    """
    Fallback mock analyzer that uses weighted keyword matching and
    text pattern analysis to classify messages with varied, realistic scores.
    """
    import re
    text_lower = original_text.lower()
    score = 0  # Accumulate a threat score

    # --- Category 1: High-severity scam keywords (weight: 15 each) ---
    high_severity = [
        "gift card", "claim your", "irs", "unauthorized login", "ssn",
        "social security", "verify your account", "account suspended",
        "identity theft", "wire transfer", "western union", "moneygram",
        "usps", "package could not be delivered", "temporarily restricted",
        "verify your identity", "dropped my phone", "broken phone", "zelle",
        "phone fell in water", "this is my new number", "hi mum", "hi mom", "hi dad"
    ]
    high_matches = [kw for kw in high_severity if kw in text_lower]
    score += len(high_matches) * 15

    # --- Category 2: Medium-severity scam keywords (weight: 8 each) ---
    medium_severity = [
        "urgent", "winner", "prize", "congratulations", "congrats",
        "lottery", "inherit", "bitcoin", "crypto", "investment opportunity",
        "cashapp", "refinance", "overdue", "payment due", "act now",
        "limited time", "exclusive offer", "risk free", "guaranteed",
        "click here", "click below", "click the link", "whatsapp me",
        "send money", "transfer funds", "police", "arrest", "warrant",
        "legal action", "court order", "tax refund", "delivery details",
        "return to sender", "bank alert", "suspicious activity",
        "pay a bill", "processing fee", "pay my rent", "can you transfer",
        "transfer money", "my new number"
    ]
    medium_matches = [kw for kw in medium_severity if kw in text_lower]
    score += len(medium_matches) * 8

    # --- Category 3: Low-severity suspicious words (weight: 3 each) ---
    low_severity = [
        "win", "free", "offer", "deal", "discount", "password",
        "bank account", "suspend", "expire", "confirm", "update your",
        "dear customer", "dear user", "dear sir", "selected", "chosen",
        "immediately", "asap", "right away", "don't delay", "alert",
        "restricted", "access"
    ]
    low_matches = [kw for kw in low_severity if kw in text_lower]
    score += len(low_matches) * 3

    # --- Pattern Analysis: Impersonation / "Hi Mum" (weight: 15 each) ---
    impersonation_patterns = [
        r"hi\s+(mum|mom|dad|mother|father)",
        r"this\s+is\s+(my\s+)?new\s+number",
        r"phone\s+(fell|dropped)\s+in\s+(the\s+)?water",
        r"phone\s+is\s+broken"
    ]
    impersonation_count = sum(1 for p in impersonation_patterns if re.search(p, text_lower))
    score += impersonation_count * 15

    # --- Pattern Analysis: URLs (weight: 10 for suspicious URLs) ---
    urls = re.findall(r'https?://\S+', text_lower)
    shortened_url_domains = ["bit.ly", "tinyurl", "t.co", "goo.gl", "is.gd", "shorturl"]
    has_suspicious_url = False
    for url in urls:
        if any(domain in url for domain in shortened_url_domains):
            score += 15
            has_suspicious_url = True
        else:
            # Any URL adds some suspicion
            score += 8
            has_suspicious_url = True

    # --- Pattern Analysis: Urgency phrases (weight: 6 each) ---
    urgency_phrases = [
        r"act\s+now", r"don'?t\s+ignore", r"last\s+chance", r"final\s+warning",
        r"respond\s+immediately", r"within\s+\d+\s+hours?", r"expires?\s+today",
        r"time\s+is\s+running\s+out", r"hurry", r"before\s+it'?s?\s+too\s+late",
        r"urgent(?:ly)?", r"immediately", r"today"
    ]
    urgency_count = sum(1 for p in urgency_phrases if re.search(p, text_lower))
    score += urgency_count * 6

    # --- Pattern Analysis: Requests for personal information (weight: 10 each) ---
    personal_info_patterns = [
        r"(send|provide|share|confirm|verify)\s+(your|ur)\s+(password|ssn|social|account|pin|otp|code|credit\s*card|identity)",
        r"(bank|account|card)\s+(number|details|information|info)",
        r"(date\s+of\s+birth|mother'?s?\s+maiden|security\s+question)"
    ]
    pii_count = sum(1 for p in personal_info_patterns if re.search(p, text_lower))
    score += pii_count * 10

    # --- Pattern Analysis: Financial language (weight: 5 each) ---
    financial_patterns = [
        r"\$\d+", r"£\d+", r"₹\d+", r"\d+\s*dollars?", r"\d+\s*rupees?",
        r"(million|billion|thousand)\s+(dollars?|pounds?|euros?)",
        r"(money|cash|funds?|payment)\s+(transfer|send|deposit|receive|pay)",
        r"pay\s+you\s+back", r"pay\s+my\s+rent", r"transfer\s+\$\d+"
    ]
    financial_count = sum(1 for p in financial_patterns if re.search(p, text_lower))
    score += financial_count * 5

    # --- Pattern Analysis: ALL CAPS words (more than 3 caps words = suspicious) ---
    caps_words = re.findall(r'\b[A-Z]{3,}\b', original_text)
    if len(caps_words) >= 3:
        score += 5

    # Collect all keyword matches for reporting
    all_matches = high_matches + medium_matches + low_matches

    # --- Determine classification based on accumulated score ---
    if score >= 20:
        # SCAM classification
        probability = min(max(35 + score, 40), 99)

        reasons = []
        if all_matches:
            reasons.append(f"Message contains suspicious trigger words: {', '.join(all_matches[:4])}.")
        if urgency_count > 0:
            reasons.append("High-urgency or threatening tone detected, pressuring immediate action.")
        if has_suspicious_url:
            reasons.append("Contains URL links that may lead to phishing or malicious sites.")
        if pii_count > 0:
            reasons.append("Requests sensitive personal information such as passwords, SSNs, or account details.")
        if financial_count > 0:
            reasons.append("References specific monetary amounts or financial transactions, common in fraud schemes.")
        if high_matches:
            reasons.append(f"High-severity scam indicators found: {', '.join(high_matches[:3])}.")
        if len(caps_words) >= 3:
            reasons.append("Excessive use of capitalized words to create a sense of alarm.")
        # Ensure at least 2 reasons
        if len(reasons) < 2:
            reasons.append("The message structure and tone match common patterns seen in scam communications.")
            reasons.append("Calls for direct action (e.g., verifying accounts, clicking links, or calling unknown numbers).")
        reasons = reasons[:4]

        recommendations = [
            "Do not click any links or call any numbers provided in the message.",
            "Never share passwords, banking credentials, or personal information (like SSN).",
            "Contact the purported sender organization directly via their official, trusted channels."
        ]
        return {
            "prediction": "Scam",
            "probability": probability,
            "reasons": reasons,
            "recommendations": recommendations
        }
    else:
        # SAFE classification — score is 0-19, map to a probability of 2-18
        probability = max(2, min(score + 2, 18))

        reasons = []
        if all_matches:
            reasons.append(f"Some potentially suspicious words detected ({', '.join(all_matches[:3])}), but insufficient to indicate a scam.")
        else:
            reasons.append("No common scam trigger words or high-urgency indicators detected.")
        reasons.append("The content structure appears normal and conversational.")
        if not has_suspicious_url:
            reasons.append("No suspicious links or URL redirects were found in the message.")
        else:
            reasons.append("A URL was found but does not match known malicious patterns.")
        reasons.append("No requests for sensitive personal data or credentials were identified.")
        reasons = reasons[:3]

        recommendations = [
            "This message appears to be safe, but continue to exercise normal caution with unknown senders.",
            "Keep software updated and never share verification codes (OTPs) with anyone."
        ]
        return {
            "prediction": "Safe",
            "probability": probability,
            "reasons": reasons,
            "recommendations": recommendations
        }
