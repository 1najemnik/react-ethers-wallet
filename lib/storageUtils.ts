import CryptoJS from "crypto-js";

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};

export const setPassword = (password: string) => {
  const hashedPassword = hashPassword(password);
  sessionStorage.setItem("wallet_password", hashedPassword);
};

export const getPassword = (): string | null => {
  return sessionStorage.getItem("wallet_password");
};

export const isPasswordSet = (): boolean => {
  return getPassword() !== null;
};

export const clearPassword = () => {
  sessionStorage.removeItem("wallet_password");
};

const encryptData = (data: WalletData, password: string): string => {
  const jsonData = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonData, password).toString();
};

const decryptData = (encryptedData: string, password: string): WalletData | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedData) {
      throw new Error("Decryption resulted in empty data.");
    }

    return JSON.parse(decryptedData);
  } catch {
    return null;
  }
};

export const saveEncryptedData = (key: string, data: WalletData) => {
  const password = getPassword();
  if (!password) {
    throw new Error("Password not set in session storage");
  }
  const encryptedData = encryptData(data, password);
  localStorage.setItem(key, encryptedData);
};

export const loadEncryptedData = (key: string): WalletData | null => {
  const password = getPassword();
  if (!password) {
    throw new Error("Password not set in session storage");
  }
  const encryptedData = localStorage.getItem(key);
  if (!encryptedData) return null;

  try {
    return decryptData(encryptedData, password);
  } catch (error) {
    throw new Error("Failed to decrypt data. Password may have changed.");
  }
};

export const removeEncryptedData = (key: string) => {
  localStorage.removeItem(key);
};
