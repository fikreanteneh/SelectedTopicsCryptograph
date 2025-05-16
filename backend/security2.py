# from rsa import generate_rsa_key_pair, modular_inverse  # Import your RSA implementation
# from os import urandom
# from flask import json
# from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

# # Generate RSA key pair using your implementation
# private_key, public_key = generate_rsa_key_pair()


# # Export public key
# def get_public_key():
#     e, n = public_key
#     return {"e": e, "n": n}


# # Decrypt session key using private key
# def decrypt_session_key(encrypted_session_key):
#     d, n = private_key
#     # Decrypt the session key using RSA decryption: (encrypted_session_key^d) % n
#     decrypted_session_key = pow(
#         int.from_bytes(encrypted_session_key, byteorder="big"), d, n
#     )
#     return decrypted_session_key.to_bytes(
#         (decrypted_session_key.bit_length() + 7) // 8, byteorder="big"
#     )


# # Encrypt and Decrypt message using session key
# def encrypt_message(message, session_key):
#     iv = urandom(12)  # Generate a random IV (12 bytes for AES-GCM)
#     encryptor = Cipher(
#         algorithms.AES(session_key),
#         modes.GCM(iv),
#     ).encryptor()

#     ciphertext = encryptor.update(message.encode()) + encryptor.finalize()
#     return iv + ciphertext + encryptor.tag  # Combine IV, ciphertext, and tag


# def decrypt_message(encrypted_data, session_key):
#     iv = encrypted_data[:12]  # Extract the IV (first 12 bytes)
#     ciphertext = encrypted_data[
#         12:-16
#     ]  # Extract the ciphertext (excluding the last 16 bytes)
#     tag = encrypted_data[-16:]  # Extract the authentication tag (last 16 bytes)

#     decryptor = Cipher(
#         algorithms.AES(session_key),
#         modes.GCM(iv, tag),  # Pass the IV and tag
#     ).decryptor()

#     return decryptor.update(ciphertext) + decryptor.finalize()  # Return decrypted bytes


# # Encrypt and decrypt JSON data
# def encrypt_json(data, session_key):
#     json_string = json.dumps(data)  # Convert JSON to string
#     encrypted_data = encrypt_message(json_string, session_key)  # Encrypt the string
#     return encrypted_data  # Return raw bytes


# def decrypt_json(encrypted_data, session_key):
#     decrypted_string = decrypt_message(
#         encrypted_data, session_key
#     ).decode()  # Decrypt and decode to string
#     json_data = json.loads(decrypted_string)  # Parse the decrypted string back to JSON
#     return json_data
