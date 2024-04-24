"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFiles = exports.postShareFile = exports.postFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_validator_1 = require("express-validator");
const fileEncryptionHelper = __importStar(require("../helpers/file-encryption"));
const getUserData_1 = __importDefault(require("../helpers/getUserData"));
class CustomError extends Error {
    constructor(message, statusCode, data) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}
const postFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new CustomError(errors.array()[0].msg, 422, errors.array());
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const user_id = req.params.creator_id;
        let fileContent = req.body.content;
        const fileName = `${Date.now() + Math.floor(Math.random() * 1000)}.txt`;
        const filePath = path_1.default.join(__dirname, '../../', 'files', fileName);
        // Encrypting the fileContent
        fileContent = Buffer.from(fileContent);
        const encryptedFileContent = fileEncryptionHelper.encrypt(fileContent);
        // Create the files directory if it doesn't exist
        if (!fs_1.default.existsSync(path_1.default.dirname(filePath))) {
            fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
        }
        yield fs_1.default.promises.writeFile(filePath, encryptedFileContent);
        const userDataPath = path_1.default.join(__dirname, '../../', 'user.json');
        const users = yield (0, getUserData_1.default)(userDataPath); // using helper function
        users.forEach((user) => {
            if (user.id.toString() === user_id) {
                const endIndex = fileName.length - 4;
                user.created_files.push(Number(fileName.slice(0, endIndex)));
            }
        });
        yield fs_1.default.promises.writeFile(userDataPath, JSON.stringify(users, null, 2));
        res.status(201).json({ message: "File created successfully" });
    }
    catch (err) {
        if (!(err instanceof CustomError)) {
            err = new CustomError('An unexpected error occurred', 500, null);
        }
        next(err);
    }
});
exports.postFile = postFile;
const postShareFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file_id = req.query.file_id;
        const sharer_id = req.params.sharer_id;
        const sharedTo = req.body.username;
        const userDataPath = path_1.default.join(__dirname, '../../', 'user.json');
        const users = yield (0, getUserData_1.default)(userDataPath);
        const sharer = users.filter((user) => {
            return user.id.toString() === sharer_id;
        });
        if (sharer[0].username === sharedTo) {
            const error = new CustomError('User can not share a file to himself', 403, null);
            throw error;
        }
        if (sharer[0].created_files.some((file) => file.toString() === file_id)) {
            const user = users.filter((user) => user.username === sharedTo);
            if (user) {
                user[0].accessible_files.push(Number(file_id));
                yield fs_1.default.promises.writeFile(userDataPath, JSON.stringify(users, null, 2));
                res.status(200).json({ message: "User added successfully" });
            }
            else {
                const error = new CustomError('User with whom you are sharing file does not exist', 404, null);
                throw error;
            }
        }
        else {
            const error = new CustomError('You are not authorized to share this file', 401, null);
            throw error;
        }
    }
    catch (err) {
        if (!(err instanceof CustomError)) {
            err = new CustomError('An unexpected error occurred', 500, null);
        }
        next(err);
    }
});
exports.postShareFile = postShareFile;
const getAllFiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessor_id = req.params.accessor_id; // User who is accessing all files
        const userDataPath = path_1.default.join(__dirname, '../../', 'user.json');
        const users = yield (0, getUserData_1.default)(userDataPath);
        // Find the user in the users array
        const user = users.find((user) => user.id.toString() === accessor_id);
        if (!user) {
            throw new CustomError('User not found', 404, null);
        }
        const filesToSend = [];
        const filesPath = path_1.default.join(__dirname, '../../', 'files');
        // Reading every file in the files folder
        const fileNames = yield fs_1.default.promises.readdir(filesPath);
        const fileReadPromises = fileNames.map((fileName) => __awaiter(void 0, void 0, void 0, function* () {
            const filePath = path_1.default.join(filesPath, fileName);
            const encryptedFileContent = yield fs_1.default.promises.readFile(filePath);
            const endIndex = fileName.length - 4;
            const file_id = Number(fileName.slice(0, endIndex));
            // Check if the file is created by the user or is accessible to the user
            if (user.created_files.includes(file_id) || user.accessible_files.includes(file_id)) {
                const fileContent = fileEncryptionHelper.decrypt(encryptedFileContent);
                filesToSend.push({ file_id: file_id.toString(), fileContent: fileContent.toString() });
            }
            else {
                filesToSend.push({ file_id: file_id.toString(), fileContent: encryptedFileContent });
            }
        }));
        yield Promise.all(fileReadPromises);
        res.status(200).json({ files: filesToSend });
    }
    catch (err) {
        if (!(err instanceof CustomError)) {
            err = new CustomError('An unexpected error occurred', 500, null);
        }
        next(err);
    }
});
exports.getAllFiles = getAllFiles;
