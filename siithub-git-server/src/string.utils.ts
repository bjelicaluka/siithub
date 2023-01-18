export const truncate = (str: string, len: number) => (str.length > len ? str.substring(0, len - 3) + "..." : str);

export const isCommitSha = (str: string) => /^[0-9a-f]{40}$/.test(str);
