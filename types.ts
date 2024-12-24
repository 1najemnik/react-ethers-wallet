type AddressData = {
    privateKey: string;
    address: string;
    path: string;
    balance: string;
};
type WalletData = {
    mnemonic: string;
    addresses: AddressData[];
};
type Transaction = {
    hash: string;
    from: string;
    to: string;
    value: string;
};