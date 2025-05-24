import random
from sympy import isprime
import base64


def generate_large_prime(bits):
    while True:
        num = random.getrandbits(bits)
        if isprime(num):
            return num


# Extended Euclidean Algorithm to find modular inverse
def modular_inverse(e, totient):
    def egcd(a, b):
        if a == 0:
            return b, 0, 1
        g, x, y = egcd(b % a, a)
        return g, y - (b // a) * x, x

    g, x, _ = egcd(e, totient)
    if g != 1:
        raise ValueError("Modular inverse does not exist")
    return x % totient


def generate_rsa_key_pair(bits=2048):
    while True:
        # Step 1: Generate two large prime numbers, p and q
        p = generate_large_prime(bits // 2)
        q = generate_large_prime(bits // 2)

        # Step 2: Compute n = p * q
        n = p * q

        # Step 3: Compute totient = (p - 1) * (q - 1)
        totient = (p - 1) * (q - 1)

        # Step 4: Choose e such that 1 < e < totient and gcd(e, totient) = 1
        e = 65537  # Common choice for e
        if totient % e == 0:
            continue  # Retry if e is not coprime with totient this is verly unlikely

        # Step 5: Compute d, the modular inverse of e mod totient
        try:
            d = modular_inverse(e, totient)
        except ValueError:
            continue  # Retry if modular inverse does not exist

        # Public key: (e, n), Private key: (d, n)
        public_key = (e, n)
        private_key = (d, n)
        return private_key, public_key


def encrypt_rsa(message, public_key):
    e, n = public_key
    # Convert message to integer
    message_int = int.from_bytes(message.encode("utf-8"), byteorder="big")
    # Encrypt using RSA formula: c = m^e mod n
    cipher_int = pow(message_int, e, n)
    return cipher_int


def decrypt_rsa(ciphertext, private_key):
    d, n = private_key
    # Decrypt using RSA formula: m = c^d mod n
    message_int = pow(ciphertext, d, n)
    # Convert integer back to bytes
    message_bytes = message_int.to_bytes(
        (message_int.bit_length() + 7) // 8, byteorder="big"
    )
    return message_bytes.decode("utf-8")


def format_in_pem(keys):
    e, n = keys
    # Convert modulus and exponent to bytes
    modulus_bytes = n.to_bytes((n.bit_length() + 7) // 8, byteorder="big")
    exponent_bytes = e.to_bytes((e.bit_length() + 7) // 8, byteorder="big")

    # Concatenate and encode in base64
    key_bytes = modulus_bytes + exponent_bytes
    pem_body = base64.encodebytes(key_bytes).decode("ascii").replace("\n", "")

    # Format as PEM
    pem = f"""-----BEGIN RSA PUBLIC KEY-----
{pem_body}
-----END RSA PUBLIC KEY-----"""
    return pem


if __name__ == "__main__":
    # Example usage
    private, public = generate_rsa_key_pair()
    print(format_in_pem(public))
    print(format_in_pem(private))
