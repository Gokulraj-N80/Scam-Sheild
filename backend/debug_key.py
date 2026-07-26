import os
from dotenv import load_dotenv
import base64

load_dotenv()

raw = os.environ.get("FIREBASE_PRIVATE_KEY", "")
pk = raw.replace('\r\n', '\n').replace('\r', '\n').replace('\\n', '\n').strip('"').strip("'")

lines = pk.splitlines()
all_data_lines = [l for l in lines if not l.startswith("-----")]
full_b64 = ''.join(all_data_lines)
print(f"Full base64 length: {len(full_b64)}")
print(f"Length mod 4: {len(full_b64) % 4}")
print(f"  (standard RSA private keys should be divisible by 4)")

# Show last few base64 lines
print("\nLast 3 data lines:")
for l in all_data_lines[-3:]:
    print(f"  len={len(l)}: '{l}'")

# A proper PKCS8 RSA-2048 key DER is typically 1216 bytes -> ~1621 b64 chars (not divisible by 4)
# The key is likely missing padding characters '='
padded = full_b64 + '=' * (-len(full_b64) % 4)
print(f"\nWith padding, length: {len(padded)}")
try:
    decoded = base64.b64decode(padded)
    print(f"Decoded bytes: {len(decoded)}")
    print("Base64 decode with padding: SUCCESS")
    
    # Try to reconstruct the PEM
    import textwrap
    b64_wrapped = '\n'.join(textwrap.wrap(base64.b64encode(decoded).decode(), 64))
    reconstructed_pem = f"-----BEGIN PRIVATE KEY-----\n{b64_wrapped}\n-----END PRIVATE KEY-----\n"
    
    from cryptography.hazmat.primitives.serialization import load_pem_private_key
    key = load_pem_private_key(reconstructed_pem.encode(), password=None)
    print("Cryptography load of reconstructed PEM: SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
