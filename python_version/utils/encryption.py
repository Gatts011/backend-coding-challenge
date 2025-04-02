import os
import base64
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import PBKDF2
from typing import Tuple

# Constants for encryption
IV_LENGTH = 12
AUTH_TAG_LENGTH = 16
KEY_LENGTH = 32  # 256 bits

def generate_user_key(user_id: str) -> bytes:
    """Generate a user-specific key from user_id using PBKDF2."""
    salt = b'secure_salt'  # In production, use a unique salt per user
    return PBKDF2(
        user_id.encode(),
        salt,
        dkLen=KEY_LENGTH,
        count=100000
    )

def encrypt(message: str, user_id: str) -> str:
    """Encrypt a message for a specific user using AES-256-GCM."""
    # Generate a random IV
    iv = get_random_bytes(IV_LENGTH)
    
    # Generate user-specific key
    key = generate_user_key(user_id)
    
    # Create cipher
    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
    
    # Encrypt the message
    ciphertext, auth_tag = cipher.encrypt_and_digest(message.encode())
    
    # Combine IV, auth tag, and encrypted message
    combined = iv + auth_tag + ciphertext
    
    # Return base64 encoded string
    return base64.b64encode(combined).decode('utf-8')

def decrypt(encrypted_message: str, user_id: str) -> str:
    """Decrypt a message for a specific user."""
    try:
        # Decode base64
        combined = base64.b64decode(encrypted_message)
        
        # Extract IV, auth tag, and encrypted message
        iv = combined[:IV_LENGTH]
        auth_tag = combined[IV_LENGTH:IV_LENGTH + AUTH_TAG_LENGTH]
        ciphertext = combined[IV_LENGTH + AUTH_TAG_LENGTH:]
        
        # Generate user-specific key
        key = generate_user_key(user_id)
        
        # Create cipher
        cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
        
        # Decrypt the message
        decrypted = cipher.decrypt_and_verify(ciphertext, auth_tag)
        
        return decrypted.decode('utf-8')
    except Exception as e:
        raise ValueError('Decryption failed: Invalid message or wrong user') from e

def broken_decrypt(encrypted_message: str, user_id: str) -> str:
    """Broken decryption function for debugging."""
    # Original broken implementation
    combined = base64.b64decode(encrypted_message)
    iv = combined[:IV_LENGTH]
    ciphertext = combined[IV_LENGTH:]
    key = generate_user_key(user_id)
    
    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
    decrypted = cipher.decrypt(ciphertext)
    
    return decrypted.decode('utf-8') 