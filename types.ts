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