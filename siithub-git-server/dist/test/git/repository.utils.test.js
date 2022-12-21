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
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const cmd_utils_1 = require("../../src/cmd.utils");
const repository_utils_1 = require("../../src/git/repository.utils");
(0, globals_1.describe)("Repository Utils", () => {
    // remove user and group if exist before running tests
    (0, globals_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, cmd_utils_1.execCmd)(`deluser --remove-home test-user`);
        }
        catch (error) {
            //
        }
        try {
            yield (0, cmd_utils_1.execCmd)(`delgroup test-repository-name`);
        }
        catch (error) {
            //
        }
    }));
    (0, globals_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, cmd_utils_1.execCmd)(`deluser --remove-home test-user`);
        }
        catch (error) {
            //
        }
        try {
            yield (0, cmd_utils_1.execCmd)(`delgroup test-repository-name`);
        }
        catch (error) {
            //
        }
    }));
    (0, globals_1.describe)("createRepo", () => {
        (0, globals_1.it)("should create repository with a specific owner", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, repository_utils_1.createRepo)("test-user", "test-repository-name");
            yield (0, globals_1.expect)((0, cmd_utils_1.execCmd)(`ls -la /home/test-user/test-repository-name`)).resolves.not.toHaveLength(0);
        }));
    });
    (0, globals_1.describe)("removeRepo", () => {
        (0, globals_1.it)("should remove repository with a specific owner", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, repository_utils_1.createRepo)("test-user", "test-repository-name");
            yield (0, globals_1.expect)((0, cmd_utils_1.execCmd)(`ls -la /home/test-user/test-repository-name`)).resolves.not.toHaveLength(0);
            yield (0, repository_utils_1.removeRepo)("test-user", "test-repository-name");
            yield (0, globals_1.expect)((0, cmd_utils_1.execCmd)(`ls -la /home/test-user/test-repository-name`)).rejects.not.toHaveLength(0);
        }));
    });
});
