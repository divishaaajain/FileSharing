# FileSharing
Backend system for a secure file-sharing platform that allows users to share encrypted text files and add other users to access those files, and view decrypted files shared with them.

# Steps to run this project locally
1. Install node.js in your system
2. Open project and run 'npm install' in the project terminal to install the required dependencies 
3. Run 'npm start' to run the project on http://localhost:3000

# API endpoints and usage
Auth Routes:-
1. /signup :- Users can signup with a unique username
- Method: POST
- Path: /signup
- Request Body: {username: unique username}
- Response: A success message indicating that the user has registered successfully

User Routes:-
1. /upload/:creator_id :- Users can upload files which we be stored on the server in excrypted form
- Method: POST
- Path: /upload/:creator_id
- Request Body: {content: The file content to be uploaded}
- Route Parameters: ':creator_id' - The ID of the user who is uploading the file
- Response: A success message indicating that the file has been uploaded/created successfully

2. /share/:sharer_id?file_id - A user can add other users to their file to give them the access to the decrypted file content
- Method: POST
- Path: /share/:sharer_id?file_id
- Request Body: {username: user to whom file is being shared}
- Route Parameter: ':sharer_id' - The ID of the user who is sharing the file
- Query/URL Parameter: 'file_id' The ID of the file being shared
- Response: A success message indicating that the User has been added successfully to the file

4. /files/:accessor_id - Allows users to view all encrypted files created by all users. Only files shared with the user or created by the user will be decrypted and visible in plain text
- Method: GET
- Path: /files/:accessor_id
- Route Parameter: ':accessor_id' - The ID of the user who is retrieving all files
- Response: A JSON object containing an array of files, each with its ID and content. The content can be either encrypted or decrypted, depending on the user's access rights.

# AES Encryption
-  The implementation below uses AES-256 in CTR (Counter) mode for encryption

1. AES encryption and decryption using the 'crypto' module
- import * as crypto from 'crypto';

2.Environment Variables: The ENCRYPTION_ALGORITHM and ENCRYPTION_SECRET_KEY are used to define the encryption algorithm and secret key, respectively. These should be kept secure and not hard-coded in the source code.

const algorithm: string = `${process.env.ENCRYPTION_ALGORITHM}`;
let key: string = `${process.env.ENCRYPTION_SECRET_KEY}`;
key = crypto.createHash('sha256').update(String(key)).digest('base64').slice(0, 32);

3. Encryption (encrypt function): 
- Generates a random initialization vector (IV) using crypto.randomBytes(16).
- Creates a cipher using crypto.createCipheriv with the specified algorithm (ENCRYPTION_ALGORITHM), secret key (key), and IV.
- Returns the concatenated buffer of the IV and the encrypted content (cipher.update(buffer) and cipher.final()).

export const encrypt = (buffer: Buffer): Buffer => {
    const iv: Buffer = crypto.randomBytes(16);
    const cipher: crypto.Cipher = crypto.createCipheriv(algorithm, key, iv);
    return Buffer.concat([iv, cipher.update(buffer), cipher.final()]) as Buffer;   
};

4. Decryption (decrypt function):
- Extracts the IV from the beginning of the encrypted buffer.
- Removes the IV from the encrypted buffer.
- Creates a decipher using crypto.createDecipheriv with the same algorithm, secret key, and IV.
- Returns the decrypted content by concatenating the result of decipher.update(encrypted) and decipher.final().

export const decrypt = (encrypted: Buffer): Buffer => {
   const iv: Buffer = encrypted.slice(0, 16);               
   encrypted = encrypted.slice(16);                       
   const decipher: crypto.Decipher = crypto.createDecipheriv(algorithm, key, iv);
   return Buffer.concat([decipher.update(encrypted), decipher.final()]) as Buffer;       
};

