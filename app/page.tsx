"use client";

import React, { useState, useEffect, Fragment } from "react";
import { useWallet } from "../hooks/useWallet";
import { restoreWalletFromMnemonic } from "../lib/ethersUtils";
import { setPassword, isPasswordSet } from "../lib/storageUtils";
import bip39 from "bip39";

const Page = () => {
  const { setNewWallet } = useWallet({});
  const [password, setPasswordInput] = useState("");
  const [mnemonicLength, setMnemonicLength] = useState(12);
  const [mnemonic, setMnemonic] = useState<string[]>(new Array(12).fill(""));
  const [status, setStatus] = useState<string | null>(null);
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setIsPasswordSaved(isPasswordSet());
    fillMnemonicFields(mnemonicLength);
  }, [mnemonicLength]);

  const generateRandomMnemonic = (length: number): string[] => {
    const randomMnemonic = bip39.generateMnemonic(length === 12 ? 128 : 256);
    return randomMnemonic.split(" ");
  };

  const handleMnemonicChange = (index: number, value: string) => {
    const updatedMnemonic = [...mnemonic];
    updatedMnemonic[index] = value.trim().toLowerCase();
    setMnemonic(updatedMnemonic);

    if (value.length > 2) {
      const wordSuggestions = bip39.wordlists.english.filter((word) =>
        word.startsWith(value.toLowerCase())
      );
      setSuggestions(wordSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleRestoreFromMnemonic = () => {
    const fullMnemonic = mnemonic.join(" ");
    try {
      if (fullMnemonic.split(" ").length !== mnemonicLength) {
        setStatus(`Please enter ${mnemonicLength} words.`);
        return;
      }
      const restoredWallet = restoreWalletFromMnemonic(fullMnemonic);
      setNewWallet(restoredWallet);
      setStatus("Wallet restored successfully from mnemonic!");
    } catch {
      setStatus("Invalid mnemonic phrase.");
    }
  };

  const handleSavePassword = () => {
    if (!password) {
      setStatus("Please enter a password.");
      return;
    }
    setPassword(password);
    setIsPasswordSaved(true);
    setStatus("Password saved successfully!");
  };

  const handleChangeMnemonicLength = (newLength: number) => {
    setMnemonicLength(newLength);
    fillMnemonicFields(newLength);
  };

  const fillMnemonicFields = (length: number) => {
    const randomMnemonic = generateRandomMnemonic(length);
    setMnemonic(randomMnemonic);
  };

  const handlePasteMnemonic = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const words = clipboardText.split(" ");
      if (words.length === 12 || words.length === 24) {
        setMnemonic(words);
        setMnemonicLength(words.length);
        setStatus(null);
      } else {
        setStatus("Invalid mnemonic phrase length. Please ensure the phrase contains 12 or 24 words.");
      }
    } catch {
      setStatus("Failed to read clipboard content.");
    }
  };

  const handleCopyMnemonicToClipboard = () => {
    const mnemonicString = mnemonic.join(" ");
    navigator.clipboard.writeText(mnemonicString).then(() => {
      setStatus("Mnemonic copied to clipboard!");
    }).catch(() => {
      setStatus("Failed to copy mnemonic to clipboard.");
    });
  };

  return (
    <Fragment>
      <h1 className="text-3xl font-bold mb-6">Wallet Management</h1>
      {status && <p className="text-red-500 mb-6">{status}</p>}
      <div className="border p-4 mb-4 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Set Encryption Password</h2>
        <input
          type="password"
          placeholder="Enter password to encrypt your data"
          value={password}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSavePassword();
            }
          }}
        />
        <button
          onClick={handleSavePassword}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg w-full"
        >
          Save Password
        </button>
      </div>

      <div className="flex flex-col gap-8">
        <div className="border p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Restore Wallet from Mnemonic</h2>
          <div className="mb-4">
            <label className="mr-4">Mnemonic Length:</label>
            <select
              value={mnemonicLength}
              onChange={(e) => handleChangeMnemonicLength(Number(e.target.value))}
              className="p-2 border rounded-lg"
            >
              <option value={12}>12 Words</option>
              <option value={24}>24 Words</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {mnemonic.map((word, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Word ${index + 1}`}
                value={word}
                onChange={(e) => handleMnemonicChange(index, e.target.value)}
                className="w-full p-2 border rounded-lg"
                disabled={!isPasswordSaved}
              />
            ))}
          </div>
          {suggestions.length > 0 && (
            <div className="absolute bg-white shadow-md w-full max-w-md mt-2 rounded-lg">
              <ul className="max-h-60 overflow-auto border p-2">
                {suggestions.map((word, index) => (
                  <li
                    key={index}
                    className="cursor-pointer p-2 hover:bg-gray-200"
                    onClick={() => {
                      const updatedMnemonic = [...mnemonic];
                      updatedMnemonic[mnemonic.findIndex(word => word === "")] = word;
                      setMnemonic(updatedMnemonic);
                      setSuggestions([]);
                    }}
                  >
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mb-4">
            <button
              onClick={handlePasteMnemonic}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg w-full"
            >
              Paste Mnemonic from Clipboard
            </button>
          </div>

          <button
            onClick={handleRestoreFromMnemonic}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg w-full"
            disabled={!isPasswordSaved}
          >
            Restore Wallet
          </button>

          <div className="mb-4">
            <button
              onClick={handleCopyMnemonicToClipboard}
              className="px-4 py-2 bg-green-500 text-white rounded-lg w-full"
            >
              Copy Mnemonic to Clipboard
            </button>
          </div>

        </div>
      </div>
    </Fragment>
  );
};

export default Page;
