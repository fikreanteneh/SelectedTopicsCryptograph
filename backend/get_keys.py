from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

with open("key.pem", "rb") as key_file:
    private_key = serialization.load_pem_private_key(
        key_file.read(), password=None, backend=default_backend()
    )

public_key = private_key.public_key()
numbers = public_key.public_numbers()

print("Public exponent (e):", numbers.e)
print("Modulus (n):", numbers.n)
