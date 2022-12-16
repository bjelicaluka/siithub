import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type AuthService } from "../../../src/features/auth/auth.service";
import { type User, type UserCreate, UserType } from "../../../src/features/user/user.model";
import { parseJWT } from "../../../src/utils/jwt";

describe("AuthService", () => {
  setupTestEnv("AuthService");

  let service: AuthService;

  beforeEach(async () => {
    const { authService } = await import("../../../src/features/auth/auth.service");
    service = authService;
  });

  describe("authenticate", () => {
    
    const validCredentials = {
      username: "testAuth",
      password: "T3stP@assword",
    };

    const user: UserCreate = {
      ...validCredentials,
      name: "Test",
      email: "test@siithub.com",
      bio: "Some random text",
      type: UserType.Developer
    };
    
    it("should throw AuthenticationException becase username does not exist.", async () => {
      
      const authenticate = async () => await service.authenticate({ username: "nonExistingUsername", password: "" });
      await expect(authenticate).rejects.toThrowError("The combination of username and password does not match any existing account.");
    });

    it("should throw AuthenticationException because password does not match.", async () => {
      const { userService } = await import("../../../src/features/user/user.service");
      const createdUser = await userService.create({ ...user }) as User;

      const authenticate = async () => await service.authenticate({ username: validCredentials.username, password: "radnomPassword" });
      await expect(authenticate).rejects.toThrowError("The combination of username and password does not match any existing account.");
    
      const { userRepo } = await import("../../../src/features/user/user.repo");
      await userRepo.crud.delete(createdUser._id);
    });

    it("should return AuthenticatedUser", async () => {
      const { userService } = await import("../../../src/features/user/user.service");
      const createdUser = await userService.create({ ...user }) as User;

      const authenticatedUser =  await service.authenticate(validCredentials);
      const jwtPayload = parseJWT(authenticatedUser?.token || '');

      expect(authenticatedUser).not.toBeNull();
      expect(authenticatedUser?.user._id).toEqual(createdUser._id);
      expect(jwtPayload.id).toEqual(createdUser._id + '');
      expect(jwtPayload.type).toEqual(UserType.Developer);

      const { userRepo } = await import("../../../src/features/user/user.repo");
      await userRepo.crud.delete(createdUser._id);
    });

  });

})