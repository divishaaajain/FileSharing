import fs from 'fs';
import path from 'path';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

import User from '../models/user';
import * as fileEncryptionHelper from '../helpers/file-encryption';
import usersData from '../helpers/getUserData';

class CustomError extends Error {
    statusCode: number;
    data: any;
    constructor(message: string, statusCode: number, data: any) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}

export const postFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new CustomError(errors.array()[0].msg, 422, errors.array());
            error.statusCode = 422;
            error.data = errors.array();
            throw error; 
        }
        const user_id = req.params.creator_id;
        let fileContent = req.body.content;
        const fileName = `${Date.now() + Math.floor(Math.random() * 1000)}.txt`;
        const filePath = path.join(__dirname, '../../', 'files', fileName);

        // Encrypting the fileContent
        fileContent = Buffer.from(fileContent);
        const encryptedFileContent = fileEncryptionHelper.encrypt(fileContent);

        // Create the files directory if it doesn't exist
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }
        await fs.promises.writeFile(filePath, encryptedFileContent);
        const userDataPath = path.join(__dirname, '../../', 'user.json');

        const users: User[] = await usersData(userDataPath);                    // using helper function
        users.forEach((user) => {
            if (user.id.toString() === user_id){
                const endIndex = fileName.length - 4;
                user.created_files.push(Number(fileName.slice(0, endIndex)));
            }
        });
        await fs.promises.writeFile(userDataPath, JSON.stringify(users, null, 2));
        res.status(201).json({ message: "File created successfully"});
    } catch (err) {
        if (!(err instanceof CustomError)) {
            err = new CustomError('An unexpected error occurred', 500, null);
        }
        next(err);
    }
};

export const postShareFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const file_id = req.query.file_id;
        const sharer_id = req.params.sharer_id;
        const sharedTo = req.body.username;

        const userDataPath = path.join(__dirname, '../../', 'user.json');
        const users: User[] = await usersData(userDataPath);

        const sharer = users.filter((user) => {
            return user.id.toString() === sharer_id;
        });
        if(sharer[0].username === sharedTo) {
            const error = new CustomError('User can not share a file to himself', 403, null);
            throw error;
        }
        if (sharer[0].created_files.some((file) => file.toString() === file_id)) {
            const user = users.filter((user) => user.username === sharedTo);
            if (user) {
                user[0].accessible_files.push(Number(file_id));
                await fs.promises.writeFile(userDataPath, JSON.stringify(users, null, 2));
                res.status(200).json({message: "User added successfully"});
            } else {
                const error = new CustomError('User with whom you are sharing file does not exist', 404, null);
                throw error;
            }
        } else {
            const error = new CustomError('You are not authorized to share this file', 401, null);
            throw error;
        }
    } catch (err) {
        if (!(err instanceof CustomError)) {
            err = new CustomError('An unexpected error occurred', 500, null);
        }
        next(err);
    }
};

export const getAllFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessor_id = req.params.accessor_id;             // User who is accessing all files
        const userDataPath = path.join(__dirname, '../../', 'user.json');
        const users: User[] = await usersData(userDataPath);

        // Find the user in the users array
        const user = users.find((user) => user.id.toString() === accessor_id);
        if (!user) {
            throw new CustomError('User not found', 404, null);
        }

        const filesToSend: {file_id: string; fileContent: string | Buffer}[] = [];
        const filesPath = path.join(__dirname, '../../', 'files');

        // Reading every file in the files folder
        const fileNames = await fs.promises.readdir(filesPath);
        const fileReadPromises = fileNames.map(async (fileName) => {
            const filePath = path.join(filesPath, fileName);
            const encryptedFileContent = await fs.promises.readFile(filePath);

            const endIndex = fileName.length - 4;
            const file_id = Number(fileName.slice(0, endIndex));

            // Check if the file is created by the user or is accessible to the user
            if (user.created_files.includes(file_id) || user.accessible_files.includes(file_id)) {
                const fileContent = fileEncryptionHelper.decrypt(encryptedFileContent);
                filesToSend.push({file_id: file_id.toString(), fileContent: fileContent.toString()});
            } else {
                filesToSend.push({file_id: file_id.toString(), fileContent: encryptedFileContent});
            }
        });
        await Promise.all(fileReadPromises);
        res.status(200).json({files: filesToSend});
    } catch (err) {
        if (!(err instanceof CustomError)) {
            err = new CustomError('An unexpected error occurred', 500, null);
        }
        next(err);
    }
};