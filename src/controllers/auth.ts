import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import {validationResult} from 'express-validator';

import User from '../models/user';
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

export const postSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const username: string = req.body.username;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new CustomError(errors.array()[0].msg, 422, errors.array());
            error.statusCode = 422;
            error.data = errors.array();
            throw error; 
        }
        const userDataPath: string = path.join(__dirname, '../../', 'user.json');
        const newUser: User = {
            id: Date.now()+Math.floor(Math.random()*1000),
            username: username,
            created_files: [],
            accessible_files: []
        }

        // Check if file exists
        let fileExists = false;
        try {
            await fs.promises.access(userDataPath, fs.constants.F_OK);
            fileExists = true;
        } catch (err) {}

        // Read existing users
        let users: User[] = [];
        if (fileExists) {
            users = await usersData(userDataPath);                    // using helper function
            if (users.some((user) => user.username === username)) {
                throw new CustomError('Username already exists', 422, null);
            }
        }

        // Update users array and write to file
        users.push(newUser);
        await fs.promises.writeFile(userDataPath, JSON.stringify(users, null, 2));
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        if (!(err instanceof CustomError)) {
            err = new CustomError('An unexpected error occurred', 500, null);
        }
        next(err);
    }
};
