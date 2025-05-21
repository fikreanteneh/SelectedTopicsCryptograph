# Using our own RSA implementation to generate keys

from rsa import generate_rsa_key_pair  # Import your RSA implementation
from os import urandom
from flask import json
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.asymmetric import rsa as cryptography_rsa, padding
from cryptography.hazmat.primitives import serialization, hashes

# # Generate RSA key pair using your implementation
# private_key, public_key = generate_rsa_key_pair()


# Generate RSA key pair
private_key, public_key = generate_rsa_key_pair(bits=2048)
# (d, n), (e, n)


# TODO: Fix the data format for exchange key
# Export public key
def get_public_key():
    # Convert (e, n) to a cryptography public key object
    e, n = public_key
    pub_numbers = cryptography_rsa.RSAPublicNumbers(e, n)
    pubkey_obj = pub_numbers.public_key()
    pem = pubkey_obj.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return pem


# Decrypt session key using private key
def decrypt_session_key(encrypted_session_key):
    # Accept base64 string, list, or bytes
    import base64

    if isinstance(encrypted_session_key, str):
        encrypted_session_key = base64.b64decode(encrypted_session_key)
    elif isinstance(encrypted_session_key, list):
        encrypted_session_key = bytes(encrypted_session_key)
    elif not isinstance(encrypted_session_key, bytes):
        raise ValueError("Unsupported encrypted_session_key type")

    # Build a cryptography private key object from your (d, n)
    d, n = private_key
    e, _ = public_key
    priv_numbers = cryptography_rsa.RSAPrivateNumbers(
        p=None,
        q=None,
        d=d,
        dmp1=None,
        dmq1=None,
        iqmp=None,
        public_numbers=cryptography_rsa.RSAPublicNumbers(e, n),
    )
    # Use private key for decryption
    privkey_obj = priv_numbers.private_key()
    session_key = privkey_obj.decrypt(
        encrypted_session_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    return session_key  # Should be exactly 32 bytes if frontend sends 32 bytes
    return session_key  # Should be exactly 32 bytes if frontend sends 32 bytes


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
