# PayEasy - Stellar Consensus Hackathon 2025

A web application that demonstrates how Stellar can power fast, low-cost international payments with a Web2-like user experience.

## Features

- Simple, intuitive interface for sending XLM payments on the Stellar testnet
- Real-time transaction feedback with loading animation
- Transaction details and explorer link on successful payment
- Memo field support for payment descriptions
- Error handling with clear user feedback

## Technologies Used

- Stellar JavaScript SDK
- HTML/CSS/JavaScript
- Stellar Testnet

## Live Demo

[Demo Video Link - Coming Soon]

## Screenshots

[Screenshots - Coming Soon]

## How to Use

1. Clone this repository:
   ```bash
   git clone https://github.com/KIRTIRAJ4327/PayEasy-Stellar-Consensus-2025.git
   cd PayEasy-Stellar-Consensus-2025
   ```

2. Create a Stellar testnet account:
   - Go to [Stellar Laboratory](https://laboratory.stellar.org/)
   - Generate a keypair
   - Fund your account using Friendbot
   - Save your secret key and public key

3. Update the `app.js` file:
   - Replace `REPLACE_WITH_YOUR_SECRET_KEY` with your testnet secret key

4. Open `index.html` in your browser or use a local server:
   ```bash
   npx serve
   ```

5. Send a test payment:
   - Enter a valid Stellar public key as the recipient
   - Enter an amount (e.g., 10 XLM)
   - Optionally add a memo
   - Click "Send Payment"

## Development Setup

1. Make sure you have a Stellar testnet account:
   - Create one at [Stellar Laboratory](https://laboratory.stellar.org/)
   - Get testnet XLM from [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test)

2. Update the source account:
   - Replace the `sourceSecretKey` in `JS/app.js` with your testnet secret key
   - Never use real Stellar secret keys in this demo application

## Roadmap

- Add support for multiple currencies
- Implement Stellar federation for human-readable addresses
- Add transaction history
- Integrate with a more robust wallet solution

## About the Hackathon

This project was built for the Stellar Consensus Hackathon 2025, with a focus on demonstrating that Web3 applications can have intuitive, user-friendly interfaces comparable to Web2 applications.

## Security Note

This is a demonstration application running on Stellar's testnet. For production use:
- Never expose secret keys in client-side code
- Implement proper key management and security measures
- Use a secure backend to handle sensitive operations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
