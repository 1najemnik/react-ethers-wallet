# React Ethers Wallet

This is a **React-based wallet** built using **Next.js**, designed specifically for managing **Polygon (POL)** cryptocurrency. The application allows users to create and restore wallets, manage multiple child accounts, send transactions, view balances, and access a transaction list with links to Polygonscan for detailed transaction information.

## Live Demo

You can view the live version of the app here:

[https://1najemnik.github.io/react-ethers-wallet](https://1najemnik.github.io/react-ethers-wallet)

## Features

- **HD Wallet Support**: Create a wallet using a 12/24 word mnemonic phrase, or restore an existing wallet.
- **Multiple Accounts**: Manage multiple child accounts (derived from the HD wallet) and switch between them easily.
- **Polygon Network**: Send transactions and view balances on the **Polygon** blockchain.
- **Transaction Handling**: Validate recipient addresses, display wallet balances, and handle transaction errors.
- **Transaction History**: View sent transactions directly on Polygonscan via transaction hash.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

We welcome contributions! If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Open a pull request with a clear description of your changes.

Before submitting, ensure that your code adheres to the project's coding standards and passes all tests.

## Technologies Used

This project leverages the power of the following technologies:

- **React**: A JavaScript library for building user interfaces.
- **Next.js**: A React framework for building optimized and production-ready applications.
- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Ethers.js**: A library for interacting with the Ethereum blockchain and smart contracts.
- **Polygon**: A blockchain scaling solution for Ethereum.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Polygonscan API**: For fetching transaction history and account details from the Polygon network.

## License

This project is licensed under the **MIT License**.

## Author

This project was created and maintained by:

**[Ilya Gordon](https://github.com/1najemnik)**
Feel free to reach out at [ilyagdn@gmail.com](mailto:ilyagdn@gmail.com).