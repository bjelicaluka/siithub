import * as z from "zod";
import axios from "axios";

export const sshKeySchema = z.object({
  name: z.string().min(1, "Name should be provided."),
  value: z.string(),
});

export type SshKey = z.infer<typeof sshKeySchema>;

export function createSshKey(owner: string, sshKey: SshKey) {
  return axios.post("/api/ssh-keys", { ...sshKey, owner });
}

export function updateSshKey(owner: string, id: string, sshKey: SshKey) {
  return axios.post("/api/ssh-keys/" + id, { ...sshKey, owner });
}

export function deleteSshKey(id: string) {
  return axios.post("/api/ssh-keys/" + id);
}
