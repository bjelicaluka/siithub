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
exports.removeRepo = exports.createRepo = void 0;
const nodegit_1 = require("nodegit");
const fs_1 = __importDefault(require("fs"));
const cmd_utils_1 = require("../cmd.utils");
const user_utils_1 = require("../user.utils");
const homePath = "/home";
function createRepo(username, repoName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(`${homePath}/${username}`)) {
            yield (0, user_utils_1.createUser)(username);
        }
        yield (0, cmd_utils_1.execCmd)(`addgroup -S ${repoName}`);
        yield (0, cmd_utils_1.execCmd)(`addgroup ${username} ${repoName}`);
        const repoPath = `${homePath}/${username}/${repoName}`;
        if (!fs_1.default.existsSync(`${repoPath}/.git`)) {
            yield nodegit_1.Repository.init(`${repoPath}`, 0);
            yield (0, cmd_utils_1.execCmd)(`chown -R ${username}:${repoName} ${repoPath}`);
            // owner full access | group full access (collabs) | others no access
            yield (0, cmd_utils_1.execCmd)(`chmod 770 ${repoPath}`);
        }
    });
}
exports.createRepo = createRepo;
function removeRepo(username, repoName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs_1.default.existsSync(`${homePath}/${username}/${repoName}`)) {
            yield (0, cmd_utils_1.execCmd)(`rm -r ${homePath}/${username}/${repoName}`);
            yield (0, cmd_utils_1.execCmd)(`delgroup ${repoName}`);
        }
    });
}
exports.removeRepo = removeRepo;
