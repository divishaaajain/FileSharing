import * as crypto from 'crypto';

const algorithm: string = `${process.env.ENCRYPTION_ALGORITHM}`;
let key: string = `${process.env.ENCRYPTION_SECRET_KEY}`;
key = crypto.createHash('sha256').update(String(key)).digest('base64').slice(0, 32);

export const encrypt = (buffer: Buffer): Buffer => {
    // Create an initialization vector
    const iv: Buffer = crypto.randomBytes(16);
    // Create a new cipher using the algorithm, key, and iv
    const cipher: crypto.Cipher = crypto.createCipheriv(algorithm, key, iv);
    return Buffer.concat([iv, cipher.update(buffer), cipher.final()]) as Buffer;          // encrypted buffer
};

export const decrypt = (encrypted: Buffer): Buffer => {
   const iv: Buffer = encrypted.slice(0, 16);                // iv = first 16 bytes
   encrypted = encrypted.slice(16);                          // Remaining
   const decipher: crypto.Decipher = crypto.createDecipheriv(algorithm, key, iv);
   return Buffer.concat([decipher.update(encrypted), decipher.final()]) as Buffer;         // decrypted buffer
};