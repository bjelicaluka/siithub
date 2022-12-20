import { describe, expect, it } from "@jest/globals";
import { changeGithubAccountBodySchema, createUserBodySchema } from "../../../src/features/user/user.routes";

describe("UserRoutes", () => {

  describe("createUserBodySchema", () => {

    const validCreateUser = {
      username: "test123",
      password: "T3stP@assword",
      name: "Test",
      email: "test@siithub.com",
      bio: "Some random text"
    };

    it("should be invalid because username is too short", () => {
      const invalidCreateUser = {
        ...validCreateUser,
        username: "te"
      };

      const parseResult = createUserBodySchema.safeParse(invalidCreateUser);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Username should have at least 3 characters."
      }));
    })

    it("should be invalid because username contains some non-alphanumeric characters", () => {
      const invalidCreateUser = {
        ...validCreateUser,
        username: "te$t."
      };

      const parseResult = createUserBodySchema.safeParse(invalidCreateUser);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Username should contain only alphanumeric characters."
      }));
    })

    it("should be invalid because password is too short", () => {
      const invalidCreateUser = {
        ...validCreateUser,
        password: "T3stP@a"
      };

      const parseResult = createUserBodySchema.safeParse(invalidCreateUser);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Password should have at least 8 characters."
      }));
    })

    it("should be invalid because password does not contain some capital letter", () => {
      const invalidCreateUser = {
        ...validCreateUser,
        password: "t3stp@assword"
      };

      const parseResult = createUserBodySchema.safeParse(invalidCreateUser);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Password should have at least 1 capital letter."
      }));
    })

    it("should be invalid because password does not contain some lower letter", () => {
      const invalidCreateUser = {
        ...validCreateUser,
        password: "T3STP@ASSWORD"
      };

      const parseResult = createUserBodySchema.safeParse(invalidCreateUser);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Password should have at least 1 lower letter."
      }));
    })

    it("should be invalid because password does not contain some number", () => {
      const invalidCreateUser = {
        ...validCreateUser,
        password: "TestP@assword"
      };

      const parseResult = createUserBodySchema.safeParse(invalidCreateUser);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Password should have at least 1 number."
      }));
    })

    it("should be invalid because password does not contain some special character", () => {
      const invalidCreateUser = {
        ...validCreateUser,
        password: "T3stPaassword"
      };

      const parseResult = createUserBodySchema.safeParse(invalidCreateUser);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Password should have at least 1 special character."
      }));
    })

    it("should be invalid because name is not provided", () => {
      const invalidCreateUser = {
        ...validCreateUser,
        name: ""
      };

      const parseResult = createUserBodySchema.safeParse(invalidCreateUser);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Name should be provided."
      }));
    })

    it("should be invalid because email is not valid", () => {
      const invalidCreateUser = {
        ...validCreateUser,
        email: "test@siithub"
      };

      const parseResult = createUserBodySchema.safeParse(invalidCreateUser);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Email should be valid."
      }));
    })

    it("should be valid", () => {
      const parseResult = createUserBodySchema.safeParse(validCreateUser);

      expect(parseResult.success).toBeTruthy();
    })

  });

  describe("changeGithubAccountBodySchema", () => {

    it("should be invalid because username is empty", () => {
      const invalidChangeGithubAccount = {
        username: ""
      };

      const parseResult = changeGithubAccountBodySchema.safeParse(invalidChangeGithubAccount);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Github username should be valid."
      }));
    });

    it("should be invalid because username contains _", () => {
      const invalidChangeGithubAccount = {
        username: "test_username"
      };

      const parseResult = changeGithubAccountBodySchema.safeParse(invalidChangeGithubAccount);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Github username should be valid."
      }));
    });

    it("should be invalid because username contains two --", () => {
      const invalidChangeGithubAccount = {
        username: "test--username"
      };

      const parseResult = changeGithubAccountBodySchema.safeParse(invalidChangeGithubAccount);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Github username should be valid."
      }));
    });

    it("should be invalid because username ends with -", () => {
      const invalidChangeGithubAccount = {
        username: "test-username-"
      };

      const parseResult = changeGithubAccountBodySchema.safeParse(invalidChangeGithubAccount);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Github username should be valid."
      }));
    });

    it("should be invalid because username starts with -", () => {
      const invalidChangeGithubAccount = {
        username: "-test-username"
      };

      const parseResult = changeGithubAccountBodySchema.safeParse(invalidChangeGithubAccount);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Github username should be valid."
      }));
    });

    it("should be invalid because username is too long", () => {
      const invalidChangeGithubAccount = {
        username: "test-username-with-more-then-38-characters"
      };

      const parseResult = changeGithubAccountBodySchema.safeParse(invalidChangeGithubAccount);

      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;
      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Github username should be valid."
      }));
    });
    

    it("should be valid", () => {
      const invalidChangeGithubAccount = {
        username: "test-username123"
      };

      const parseResult = changeGithubAccountBodySchema.safeParse(invalidChangeGithubAccount);

      expect(parseResult.success).toBeTruthy();
    });

  });

})