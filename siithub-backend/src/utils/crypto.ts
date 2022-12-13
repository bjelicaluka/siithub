import crypto from 'crypto';

function getRandomString(length: number): string {
  return crypto.randomBytes(length).toString('base64')
}

function getSha256Hash(text: string): string {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('base64');
}

export {
  getRandomString,
  getSha256Hash
}