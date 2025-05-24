# Selected Topics in Cryptography (Secure Chat System with RSA + Symmetric Encryption (TLS-like))

This repository is for our Selected Topics course project. The focus of this project is cryptography.

## Group Members

| Name               | ID            |
|--------------------|---------------|
| Michael Gashawtena  | UGR/3575/13   |
| Fikremariam Anteneh | UGR/9301/13   |
| Betselot Kidane     | UGR/8473/13   |
| Salahadin Juhar     | UGR/8613/13   |
| Sara Ayele          | UGR/0948/13   |

## 1. RSA Key Generation

- We'll use the `cryptography` library to generate RSA public and private keys.
- ⚠️ Even though the instructions mention implementing RSA ourselves, they also suggest using the `cryptography` library. We'll need to clarify this:
  - Either we fully implement RSA from scratch
  - Or we use the library for practical and secure key generation.

## 2. Chat Feature Implementation

### ✅ Basic Chat Functionality

- **Create Chat**: A user can create a new chat room.
- **Join Chat with Invite Link**: Others can join via an invite link.

### 👤 User Handle

- When a user joins, they enter a **handle**.
- The handle is stored in `localStorage` (can be edited later).
- Users can join multiple chats with the **same or different handle**.

### 🔐 Encryption Flow (TLS-like)

On joining a chat:

1. Client requests the **server’s public key** via `/get-public-key`.
2. Client generates a **session symmetric key** (e.g., AES key).
3. Client encrypts the session key with the **server’s RSA public key**.
4. Client sends the encrypted session key to the server.
5. Server decrypts using its **private RSA key** to retrieve the session key.
6. From then on, **all communication is encrypted using the symmetric key** (like how TLS works).

### 🚫 Authentication

- **Not required** for this version.
- We can optionally add a **simple auth system** later (e.g., token or password-based).

## 3. Slides / Presentation Content

### 📜 How RSA Works

- **Key Generation**
- **Encryption/Decryption** process
- **Why RSA alone is slow**

### 🔒 Limitations of RSA

- Slow for large data
- Requires **hybrid encryption** (RSA + AES)
- Key sizes are large and CPU-intensive

### 📡 How RSA is Used in TLS/SSL

- Overview of the **TLS handshake**
- Role of **RSA** in secure communication:
  - Used to share the symmetric key securely
  - Enables encrypted channels over insecure networks

## 4. Demo

- Show working **chat system**
- Walkthrough of the **encryption flow**

## 5. Optional Improvement: HTTPS Simulation

- Generate RSA public/private keys and a **self-signed TLS certificate**.
- Start the server using that certificate — server runs over **HTTPS** locally.
- Manually add the certificate to browser's **trusted authorities**.
- This way, even though we’re local, the browser treats it as secure.
- 🔁 Recreates real-world **TLS behavior** in a local environment.
