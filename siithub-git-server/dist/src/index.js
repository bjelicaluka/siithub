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
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const user_utils_1 = require("./user.utils");
const repository_utils_1 = require("./git/repository.utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    yield (0, user_utils_1.createUser)(username);
    res.send({ status: "ok" });
}));
app.post("/api/repositories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, repositoryName } = req.body;
    yield (0, repository_utils_1.createRepo)(username, repositoryName);
    res.send({ status: "ok" });
}));
app.listen(config_1.config.port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${config_1.config.port}`);
});
