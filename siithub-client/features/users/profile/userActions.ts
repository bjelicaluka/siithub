import axios from "axios";
import { z } from "zod";
import { passwordSchema } from "../registration/createUser";

const profileBodySchema = z.object({
  name: z.string().min(1, "Name should be provided."),
  email: z.string().email("Email should be valid."),
  bio: z.string().default("")
});

type UpdateProfile = z.infer<typeof profileBodySchema>;

const passwordBodySchema = z.object({
  oldPassword: z.string().min(1, "Old password should be provided."),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Password should be confirmed.")
}).superRefine(({ newPassword, confirmPassword }, ctx) => {
  if (confirmPassword !== newPassword) {
    ctx.addIssue({
      code: "custom",
      message: "The passwords do not match",
      path: ['confirmPassword']
    });
  }
});

type UpdatePassword = z.infer<typeof passwordBodySchema>;

function updateProfile(profile: UpdateProfile) {
  return axios.put('/api/users', profile);
}

function updatePassword(passwordUpdate: UpdatePassword) {
  return axios.put('/api/users/change-password', passwordUpdate);
}

export {
  profileBodySchema,
  passwordBodySchema,
  updateProfile,
  updatePassword
}

export type {
  UpdateProfile,
  UpdatePassword
}