from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# auto_error=False so guest users (no header) don't get a 403 crash
security = HTTPBearer(auto_error=False)

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
GOOGLE_TOKENINFO_URL = "https://www.googleapis.com/oauth2/v1/tokeninfo"


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Authenticates the caller from the Authorization Bearer token.

    Supports two modes:
      1. Mock token  — format: mock_uid|email|name  (used in mock/dev mode)
      2. Google OAuth access token — verified against Google's tokeninfo endpoint,
         then user info is fetched from Google's userinfo endpoint.
    """
    if not credentials:
        return None  # Guest user

    token = credentials.credentials
    if not token:
        return None

    # ------------------------------------------------------------------
    # Mock token handling (dev / testing)
    # ------------------------------------------------------------------
    if settings.USE_MOCK_DATABASE or token.startswith("mock_"):
        if token.startswith("mock_"):
            try:
                parts = token.split("|")
                uid   = parts[0].replace("mock_", "", 1)
                email = parts[1] if len(parts) > 1 else "guest@scamshield.local"
                name  = parts[2] if len(parts) > 2 else "Mock User"
                return {"uid": uid, "email": email, "name": name}
            except Exception:
                return {"uid": "mock_default_user", "email": "mock.default@scamshield.local", "name": "Mock User"}
        else:
            return {"uid": "mock_default_user", "email": "mock.default@scamshield.local", "name": "Mock User"}

    # ------------------------------------------------------------------
    # Real Google OAuth access token verification
    # ------------------------------------------------------------------
    try:
        # Step 1: Verify the token is valid and not expired
        tokeninfo_resp = requests.get(
            GOOGLE_TOKENINFO_URL,
            params={"access_token": token},
            timeout=5
        )
        if tokeninfo_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired Google access token")

        tokeninfo = tokeninfo_resp.json()
        if "error" in tokeninfo:
            raise HTTPException(status_code=401, detail=f"Google token error: {tokeninfo['error']}")

        # Step 2: Fetch the user profile
        userinfo_resp = requests.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to fetch Google user profile")

        profile = userinfo_resp.json()

        return {
            "uid": profile.get("id"),           # Google's unique user ID (sub)
            "email": profile.get("email"),
            "name": profile.get("name", profile.get("email", "Google User")),
            "picture": profile.get("picture"),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication token is invalid or could not be verified"
        )
