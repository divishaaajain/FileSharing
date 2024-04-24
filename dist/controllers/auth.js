"use strict";
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
exports.postSignup = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_validator_1 = require("express-validator");
const getUserData_1 = __importDefault(require("../helpers/getUserData"));
class CustomError extends Error {
    constructor(message, statusCode, data) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}
const postSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.body.username;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new CustomError(errors.array()[0].msg, 422, errors.array());
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const userDataPath = path_1.default.join(__dirname, '../../', 'user.json');
        const newUser = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            username: username,
            created_files: [],
            accessible_files: []
        };
        // Check if file exists
        let fileExists = false;
        try {
            yield fs_1.default.promises.access(userDataPath, fs_1.default.constants.F_OK);
            fileExists = true;
        }
        catch (err) { }
        // Read existing users
        let users = [];
        if (fileExists) {
            users = yield (0, getUserData_1.default)(userDataPath); // using helper function
            if (users.some((user) => user.username === username)) {
                throw new CustomError('Username already exists', 422, null);
            }
        }
        // Update users array and write to file
        users.push(newUser);
        yield fs_1.default.promises.writeFile(userDataPath, JSON.stringify(users, null, 2));
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        if (!(err instanceof CustomError)) {
            err = new CustomError('An unexpected error occurred', 500, null);
        }
        next(err);
    }
});
exports.postSignup = postSignup;
