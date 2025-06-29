import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const CONFIG_DIR = path.join(os.homedir(), '.copit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

const scryptAsync = promisify(scrypt);

export type AuthData = {
  token: string;
  username: string;
};

type EncryptedData = {
  encrypted: string;
  salt: string;
  iv: string;
  tag: string;
  username: string;
};

const getEncryptionKey = async (salt: Buffer): Promise<Buffer> => {
  // Use machine-specific identifier as password base
  const machineId = os.hostname() + os.userInfo().username;
  return (await scryptAsync(machineId, salt, KEY_LENGTH)) as Buffer;
};

const encryptToken = async (token: string): Promise<EncryptedData> => {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await getEncryptionKey(salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    username: '', // Will be set by caller
  };
};

const decryptToken = async (encryptedData: EncryptedData): Promise<string> => {
  const salt = Buffer.from(encryptedData.salt, 'hex');
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const tag = Buffer.from(encryptedData.tag, 'hex');
  const key = await getEncryptionKey(salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

const ensureConfigDir = async (): Promise<void> => {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }
};

export const saveAuth = async (authData: AuthData): Promise<void> => {
  await ensureConfigDir();

  try {
    const encryptedData = await encryptToken(authData.token);
    encryptedData.username = authData.username;

    await fs.writeFile(
      CONFIG_FILE,
      JSON.stringify(encryptedData, null, 2),
      'utf-8',
    );
  } catch (error) {
    throw new Error(
      `Failed to save authentication data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

export const loadAuth = async (): Promise<AuthData | null> => {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    const encryptedData: EncryptedData = JSON.parse(data);

    // Check if data is in old format (plaintext)
    if ('token' in encryptedData && typeof encryptedData.token === 'string') {
      // Old format detected, migrate to encrypted format
      const oldData = encryptedData as unknown as AuthData;
      await saveAuth(oldData);
      return oldData;
    }

    const decryptedToken = await decryptToken(encryptedData);

    return {
      token: decryptedToken,
      username: encryptedData.username,
    };
  } catch {
    // If decryption fails or file doesn't exist, return null
    return null;
  }
};

export const clearAuth = async (): Promise<void> => {
  try {
    await fs.unlink(CONFIG_FILE);
  } catch {
    // ファイルが存在しない場合は無視
  }
};
