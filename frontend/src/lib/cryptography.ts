// Function to encrypt the session key using the public key
export async function encryptSessionKey(
  publicKey: string,
  sessionKey: Uint8Array, // Accept sessionKey as a Uint8Array
): Promise<ArrayBuffer> {
  // Convert the public key from PEM format to a CryptoKey
  const publicKeyObj = await window.crypto.subtle.importKey(
    'spki', // SubjectPublic Key Info format
    pemToArrayBuffer(publicKey),
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' },
    },
    true,
    ['encrypt'],
  );

  // Encrypt the session key
  const encryptedKey = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKeyObj,
    sessionKey,
  );

  // Return the encrypted session key as a Base64 string
  return encryptedKey;
}

// Helper function to convert PEM to ArrayBuffer
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}

export async function sessionToCryptoKey(
  rawSessionKey: Uint8Array,
): Promise<CryptoKey> {
  return await window.crypto.subtle.importKey(
    'raw',
    rawSessionKey,
    { name: 'AES-GCM' }, // Use AES-GCM instead of AES-CFB
    false,
    ['encrypt', 'decrypt'],
  );
}

// Encrypt a message using AES-GCM
export async function encryptMessage(
  message: string,
  sessionKey: CryptoKey,
): Promise<ArrayBuffer> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV (12 bytes for AES-GCM)
  const cipher = new TextEncoder().encode(message);

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv, // Pass the IV as a Uint8Array
    },
    sessionKey,
    cipher,
  );

  // Combine IV and encrypted data
  const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
  combinedData.set(iv);
  combinedData.set(new Uint8Array(encryptedData), iv.length);

  return combinedData.buffer; // Return the combined data as an ArrayBuffer
}

// Decrypt a message using AES-GCM
export async function decryptMessage(
  encryptedData: ArrayBuffer,
  sessionKey: CryptoKey,
): Promise<string> {
  const combinedData = new Uint8Array(encryptedData); // Convert ArrayBuffer to Uint8Array
  const iv = combinedData.slice(0, 12); // Extract the IV (12 bytes for AES-GCM)
  const ciphertext = combinedData.slice(12); // Extract the encrypted data

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv, // Pass the IV as a Uint8Array
    },
    sessionKey,
    ciphertext,
  );

  return new TextDecoder().decode(decryptedData); // Decode decrypted data to string
}

// Encrypt JSON data
export async function encryptJson(
  data: object,
  sessionKey: CryptoKey,
): Promise<ArrayBuffer> {
  const jsonString = JSON.stringify(data); // Convert JSON to string
  return await encryptMessage(jsonString, sessionKey); // Encrypt the string
}

// Decrypt JSON data
export async function decryptJson(
  encryptedData: ArrayBuffer,
  sessionKey: CryptoKey,
): Promise<object> {
  try {
    const combinedData = new Uint8Array(encryptedData); // Convert ArrayBuffer to Uint8Array
    console.log(
      'Encrypted Data (base64):',
      btoa(String.fromCharCode(...combinedData)),
    );

    const iv = combinedData.slice(0, 12); // Extract the IV (12 bytes for AES-GCM)
    const encryptedContent = combinedData.slice(12); // Extract the encrypted data

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM', // Use AES-GCM instead of AES-CFB
        iv, // Pass the IV as a Uint8Array
      },
      sessionKey,
      encryptedContent,
    );

    const decryptedString = new TextDecoder().decode(decryptedData); // Decode decrypted data to string
    return JSON.parse(decryptedString); // Parse the decrypted string back to JSON
  } catch (error) {
    console.error('Decryption failed:', error); // Log the error
    throw error; // Throw an error if decryption fails
  }
}
