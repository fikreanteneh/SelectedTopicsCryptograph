import random
from sympy import isprime

# Implement RSA key generation manually


def generate_large_prime(bits):
    while True:
        num = random.getrandbits(bits)
        if isprime(num):
            return num


def modular_inverse(e, phi):
    # Extended Euclidean Algorithm to find modular inverse
    def egcd(a, b):
        if a == 0:
            return b, 0, 1
        g, x, y = egcd(b % a, a)
        return g, y - (b // a) * x, x

    g, x, _ = egcd(e, phi)
    if g != 1:
        raise ValueError("Modular inverse does not exist")
    return x % phi


def generate_rsa_key_pair(bits=2048):
    # Step 1: Generate two large prime numbers, p and q
    p = generate_large_prime(bits // 2)
    q = generate_large_prime(bits // 2)

    # Step 2: Compute n = p * q
    n = p * q

    # Step 3: Compute phi(n) = (p - 1) * (q - 1)
    phi = (p - 1) * (q - 1)

    # Step 4: Choose e such that 1 < e < phi(n) and gcd(e, phi(n)) = 1
    e = 65537  # Common choice for e
    if phi % e == 0:
        raise ValueError("e is not coprime with phi")

    # Step 5: Compute d, the modular inverse of e mod phi(n)
    d = modular_inverse(e, phi)

    # Public key: (e, n), Private key: (d, n)
    public_key = (e, n)
    private_key = (d, n)
    return private_key, public_key


# Generate RSA key pair
private_key, public_key = generate_rsa_key_pair()
