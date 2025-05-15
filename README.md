# PayEasy - Stellar Consensus Hackathon 2025

A web application that demonstrates how Stellar can power fast, low-cost international payments with a Web2-like user experience, enhanced with advanced security features and zero-knowledge proofs.

## Features

- Simple, intuitive interface for sending XLM payments on the Stellar testnet
- Advanced security through Midnight API integration:
  - Zero-knowledge proofs for privacy-preserving transactions
  - Decentralized identity verification
  - Real-time scam address detection
  - Rate limiting and suspicious activity monitoring
- Real-time exchange rates for multiple currencies
- Transaction feedback with detailed status updates
- Comprehensive input validation and security checks
- Memo field support with content validation
- Error handling with clear user feedback

## Security Features

### Midnight API Integration
PayEasy leverages the Midnight API for enhanced security:
- **Zero-Knowledge Proofs**: Verify transaction validity without exposing sensitive data
- **Decentralized Identity**: Secure user authentication without centralized databases
- **Scam Protection**: Real-time checking against known fraudulent addresses
- **Rate Limiting**: Prevent abuse through intelligent transaction monitoring
- **Suspicious Activity Detection**: Automated flagging of potentially risky transactions

### Additional Security Measures
- Session-specific encryption using Web Crypto API
- Real-time transaction validation and monitoring
- Input sanitization and validation
- Secure key management
- Transaction amount limits and validations
- Memo field content filtering

## Technologies Used

- Stellar JavaScript SDK
- Midnight API for enhanced security
- Web Crypto API for encryption
- HTML/CSS/JavaScript
- Tailwind CSS for UI
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

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the CSS:
   ```bash
   npm run build
   ```

4. Create a Stellar testnet account:
   - Go to [Stellar Laboratory](https://laboratory.stellar.org/)
   - Generate a keypair
   - Fund your account using Friendbot
   - Save your secret key and public key

5. Configure your environment:
   - Create a `.env` file with your Midnight API credentials
   - Update the source account in `config.js`

6. Start the development server:
   ```bash
   npm run serve
   ```

7. Send a test payment:
   - Enter a valid Stellar public key as recipient
   - Enter an amount (e.g., 10 XLM)
   - Optionally add a memo
   - Review the security checks status
   - Confirm the transaction

## Security Best Practices

When using PayEasy:
1. Always verify the recipient's address
2. Check transaction details before confirming
3. Never share your secret key
4. Be cautious of large or unusual transactions
5. Monitor the security status indicators

## Development Setup

1. Make sure you have a Stellar testnet account:
   - Create one at [Stellar Laboratory](https://laboratory.stellar.org/)
   - Get testnet XLM from [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test)

2. Set up your security credentials:
   - Obtain Midnight API credentials
   - Configure environment variables
   - Never commit sensitive keys to version control

## Roadmap

- Enhanced privacy features through Midnight API
- Multi-factor authentication integration
- Advanced fraud detection algorithms
- Support for multiple currencies
- Transaction history with privacy controls
- Stellar federation for human-readable addresses

## About the Hackathon

This project was built for the Stellar Consensus Hackathon 2025, showcasing how Web3 applications can combine user-friendly interfaces with advanced security features for a safer payment experience.

## Security Note

This is a demonstration application running on Stellar's testnet. For production use:
- Never expose secret keys in client-side code
- Implement proper key management
- Use secure backend services
- Enable all security features
- Regularly update dependencies
- Monitor for suspicious activities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
