"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
// dotenv.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(auth_1.default);
app.use(user_1.default);
const errorHandler = (error, req, res, next) => {
    const status = error.statusCode;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message, data });
};
app.use(errorHandler);
app.listen(3000);
