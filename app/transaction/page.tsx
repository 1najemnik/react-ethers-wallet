"use client";

import React, { Fragment, useEffect, useState } from "react";
import { useWallet } from "../../hooks/useWallet";
import { sendTransaction } from "../../lib/ethersUtils";
import { isPasswordSet } from "../../lib/storageUtils";
import { FaSpinner } from "react-icons/fa";
import { getProvider } from "@/lib/networkUtils";

const SendTransactionPage = () => {
    const { wallet, provider, updateProvider } = useWallet({});
    const [recipient, setRecipient] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [status, setStatus] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const network = "polygon";
        const newProvider = getProvider(network);
        updateProvider(newProvider);
    }, []);

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

        if (!provider) {
            setStatus("Provider is not available. Cannot send transaction.");
            return;
        }

        setIsLoading(true);
        try {
            const txResponse = await sendTransaction(wallet, provider, recipient, amount);
            setTxHash(txResponse.hash);
            setStatus("Transaction sent!");
        } catch (error) {
            console.error("Failed to send transaction:", error);
            setStatus("Transaction failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Send Transaction</h1>

            {wallet ? (
                <Fragment>
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

                    {status && (
                        <p className="text-center text-sm text-red-500">{status}</p>
                    )}

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
