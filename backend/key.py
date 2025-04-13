from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os

# Generate RSA key pair
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()


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


# Encrypt message using session key
def encrypt_message(message, session_key):
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(session_key), modes.CFB(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(message.encode()) + encryptor.finalize()
    return iv + ciphertext


# Decrypt message using session key
def decrypt_message(ciphertext, session_key):
    iv = ciphertext[:16]
    cipher = Cipher(algorithms.AES(session_key), modes.CFB(iv))
    decryptor = cipher.decryptor()
    return decryptor.update(ciphertext[16:]) + decryptor.finalize()
