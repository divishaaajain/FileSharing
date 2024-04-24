# FileSharing
Backend system for a secure file-sharing platform that allows users to share encrypted text files and add other users to access those files, and view decrypted files shared with them.

# Steps to run this project locally
1. Install node.js in your system
2. Open project and run 'npm install' in the project terminal to install the required dependencies 
3. Run 'npm start' to run the project on http://localhost:3000

# API endpoints and usage
Auth Routes:-
1. /signup :- Users can signup with a unique username
Method: POST
Path: /signup
Request Body: {username: unique username}
Response: A success message indicating that the user has registered successfully

User Routes:-
1. /upload/:creator_id :- Users can upload files which we be stored on the server in excrypted form
Method: POST
Path: /upload/:creator_id
Request Body: {content: The file content to be uploaded}
Route Parameters: ':creator_id' - The ID of the user who is uploading the file
Response: A success message indicating that the file has been uploaded/created successfully

2. /share/:sharer_id?file_id - A user can add other users to their file to give them the access to the decrypted file content
Method: POST
Path: /share/:sharer_id?file_id
Request Body: {username: user to whom file is being shared}
Route Parameter: ':sharer_id' - The ID of the user who is sharing the file
Query/URL Parameter: 'file_id' The ID of the file being shared
Response: A success message indicating that the User has been added successfully to the file

4. /files/:accessor_id - Allows users to view all encrypted files created by all users. Only files shared with the user or created by the user will be decrypted and visible in plain text
Method: GET
Path: /files/:accessor_id
Route Parameter: ':accessor_id' - The ID of the user who is retrieving all files
Response: A JSON object containing an array of files, each with its ID and content. The content can be either encrypted or decrypted, depending on the user's access rights.

# AES Encryption

