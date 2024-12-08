"use client";

import React, { Fragment, useState, useEffect } from "react";
import { useWallet } from "../../hooks/useWallet";
import { sendTransaction, validateAddress, getBalance } from "../../lib/ethersUtils";
import { isPasswordSet, loadEncryptedData } from "../../lib/storageUtils";
import { FaSpinner } from "react-icons/fa";

const SendTransactionPage = () => {
    const { wallet, provider, balance } = useWallet({});
    const [recipient, setRecipient] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [status, setStatus] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);
    const [selectedAddress, setSelectedAddress] = useState<string>("");
    const [availableAddresses, setAvailableAddresses] = useState<AddressData[]>([]);
    const [selectedAddressBalance, setSelectedAddressBalance] = useState<string>("");

    useEffect(() => {
        if (isPasswordSet()) {
            const walletData = loadEncryptedData("wallet");
            if (walletData && walletData.addresses) {
                setAvailableAddresses(walletData.addresses);
                setSelectedAddress(walletData.addresses[0]?.address || "");
            }
        }
    }, []);

    useEffect(() => {
        const loadBalance = async () => {
            if (!selectedAddress || !provider) return;

            setIsBalanceLoading(true);
            try {
                const balance = await getBalance(provider, selectedAddress);
                setSelectedAddressBalance(balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
                setSelectedAddressBalance("Error");
            } finally {
                setIsBalanceLoading(false);
            }
        };

        loadBalance();
    }, [selectedAddress, provider]);

    const handleSendTransaction = async () => {
        if (!isPasswordSet()) {
            setStatus("Password not set. Cannot send transaction.");
            return;
        }

        if (!wallet) {
            setStatus("Wallet is not connected. Please connect your wallet.");
            return;
        }

        if (!recipient || !amount || parseFloat(amount) <= 0) {
            setStatus("Please provide a valid recipient address and amount.");
            return;
        }

        if (!validateAddress(recipient)) {
            setStatus("Invalid recipient address.");
            return;
        }

        if (!provider) {
            setStatus("Provider is not available. Cannot send transaction.");
            return;
        }

        const selectedAccount = availableAddresses.find(
            (account) => account.address === selectedAddress
        );

        if (!selectedAccount) {
            setStatus("Selected address not found.");
            return;
        }

        const { path } = selectedAccount;

        setIsLoading(true);
        try {
            const txResponse = await sendTransaction(
                wallet,
                provider,
                recipient,
                amount,
                path
            );
            if (txResponse?.hash) {
                setStatus("Transaction sent!");
                setTxHash(txResponse.hash);

                const updatedBalance = await getBalance(provider, selectedAddress);
                setSelectedAddressBalance(updatedBalance);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                if ((error as { code?: string }).code) {
                    setStatus(`Transaction failed: ${(error as { code?: string }).code}`);
                } else {
                    setStatus(`Transaction failed: ${error.message}`);
                }
            } else {
                setStatus("Transaction failed: Unknown error.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md p-6 border rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Send Transaction</h1>

            {wallet ? (
                <Fragment>
                    <div className="mb-4">
                        <label htmlFor="address" className="block text-sm font-semibold">
                            Select Address
                        </label>
                        <select
                            id="address"
                            value={selectedAddress}
                            onChange={(e) => setSelectedAddress(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            disabled={isBalanceLoading}
                        >
                            {availableAddresses.map((addressData) => (
                                <option key={addressData.address} value={addressData.address}>
                                    {addressData.address}
                                </option>
                            ))}
                        </select>
                    </div>
                    {isBalanceLoading ? (
                        <p className="text-sm font-semibold">Loading balance...</p>
                    ) : (
                        <div className="mb-4">
                            <p className="text-sm font-semibold">
                                Selected Address Balance: {selectedAddressBalance} POL
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="recipient" className="block text-sm font-semibold">
                            Recipient Address
                        </label>
                        <input
                            type="text"
                            id="recipient"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Enter recipient address"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm font-semibold">
                            Amount (POL)
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Enter amount"
                        />
                    </div>

                    {balance && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold">
                                Wallet Balance: {balance} POL
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <button
                            onClick={handleSendTransaction}
                            disabled={isLoading}
                            className="w-full py-2 bg-blue-500 text-white rounded-lg"
                        >
                            {isLoading ? (
                                <FaSpinner className="animate-spin mx-auto" />
                            ) : (
                                "Send Transaction"
                            )}
                        </button>
                    </div>

                    {status && <p className="text-center text-sm text-red-500">{status}</p>}

                    {txHash && (
                        <div className="mt-4 text-center">
                            <a
                                href={`https://polygonscan.com/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                View transaction on Polygonscan
                            </a>
                        </div>
                    )}
                </Fragment>
            ) : (
                <p>Please connect your wallet first.</p>
            )}
        </div>
    );
};

export default SendTransactionPage;
