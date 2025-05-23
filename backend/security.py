# Using Cryptography library for generating RSA keys and encrypting/decrypting messages
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from os import urandom, path
import os

from flask import json

# Key file paths
PRIVATE_KEY_PATH = "private_key.pem"
PUBLIC_KEY_PATH = "public_key.pem"

def load_or_generate_keys():
    global private_key, public_key
    
    # Check if keys exist
    if path.exists(PRIVATE_KEY_PATH) and path.exists(PUBLIC_KEY_PATH):
        # Load existing keys
        with open(PRIVATE_KEY_PATH, "rb") as f:
            private_key = serialization.load_pem_private_key(
                f.read(),
                password=None
            )
        with open(PUBLIC_KEY_PATH, "rb") as f:
            public_key = serialization.load_pem_public_key(
                f.read()
            )
    else:
        # Generate new keys
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()
        
        # Save keys
        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        with open(PUBLIC_KEY_PATH, "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))

# Initialize keys
load_or_generate_keys()

# Export public key
def get_public_key():
    return public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )


# Decrypt session key using private key
def decrypt_session_key(encrypted_session_key):
    return private_key.decrypt(
        encrypted_session_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )


# Encrypt and Decrypt message using session key
def encrypt_message(message, session_key):
    iv = urandom(12)  # Generate a random IV (12 bytes for AES-GCM)
    encryptor = Cipher(
        algorithms.AES(session_key),
        modes.GCM(iv),
    ).encryptor()

    ciphertext = encryptor.update(message.encode()) + encryptor.finalize()
    return iv + ciphertext + encryptor.tag  # Combine IV, ciphertext, and tag


def decrypt_message(encrypted_data, session_key):
    iv = encrypted_data[:12]  # Extract the IV (first 12 bytes)
    ciphertext = encrypted_data[
        12:-16
    ]  # Extract the ciphertext (excluding the last 16 bytes)
    tag = encrypted_data[-16:]  # Extract the authentication tag (last 16 bytes)

    decryptor = Cipher(
        algorithms.AES(session_key),
        modes.GCM(iv, tag),
    ).decryptor()

    return decryptor.update(ciphertext) + decryptor.finalize()  # Return decrypted bytes


# Encrypt and decrypt JSON data
def encrypt_json(data, session_key):
    json_string = json.dumps(data)  # Convert JSON to string
    encrypted_data = encrypt_message(json_string, session_key)  # Encrypt the string
    return encrypted_data  # Return raw bytes


def decrypt_json(encrypted_data, session_key):
    decrypted_string = decrypt_message(
        encrypted_data, session_key
    ).decode()  # Decrypt and decode to string
    json_data = json.loads(decrypted_string)  # Parse the decrypted string back to JSON
    return json_data
