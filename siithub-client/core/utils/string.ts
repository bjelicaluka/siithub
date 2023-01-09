export const truncate = (str: string, len: number) => (str.length > len ? str.substring(0, len - 3) + "..." : str);
