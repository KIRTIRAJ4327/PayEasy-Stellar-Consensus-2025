# PayEasy - Web3 Payments with Web2 Experience

![PayEasy Logo](https://i.ibb.co/TvDdSdY/payeasy-logo.png)

## 🚀 Problem Statement 
Traditional Web3 payment applications suffer from poor user experience, requiring complicated wallet setups, seed phrase management, and confusing transaction flows. Meanwhile, international remittance services charge high fees and offer unfavorable exchange rates to millions of students and workers abroad.

Born from our personal struggles as international students in Canada sending money home, PayEasy solves these challenges by creating a Web2-like payment experience powered by Stellar and Polkadot blockchain technologies that delivers near-market exchange rates with minimal fees.

## 📊 User Base
- **International Students & Workers**: Our primary users who regularly send money home and face excessive fees
- Everyday users who want to transact with digital currency without technical knowledge
- Businesses seeking to integrate crypto payments without disrupting customer experience
- Cross-border payment users looking for faster, cheaper alternatives to traditional banks
- Financial institutions exploring blockchain integration with familiar user interfaces

## 💡 Impact
PayEasy democratizes access to blockchain payments by eliminating technical barriers, enabling millions of non-technical users to benefit from:
- Lower transaction fees (savings of 2-5% per transaction)
- Near-instant settlement across borders (vs. 2-5 days)
- Enhanced privacy and security through zero-knowledge proofs
- No need for seed phrases or complicated wallet management

## ⭐ Why Stellar
We leverage Stellar Passkeys to provide a seamless and intuitive UX by:
- Enabling biometric authentication (fingerprint/face ID) instead of passwords
- Removing the need for seed phrases and private key management
- Creating smart contract-powered wallet accounts that work like traditional accounts
- Utilizing Stellar's fast, low-cost settlement for instant transactions
- Integrating with Polkadot for enhanced privacy features via cross-chain functionality

## 📋 Implemented Features
- **Passkey Registration**: Create wallets using device biometrics without seed phrases
- **Seamless Authentication**: Login with device passkeys for Web2-like experience 
- **Multi-Chain Payments**: Send payments on both Stellar and Polkadot networks
- **Real-time Exchange Rates**: Display live currency conversions
- **Enhanced Privacy Controls**: Configurable privacy settings for transactions
- **Transaction Dashboard**: Monitor recent activity and balances
- **Transaction Simulator**: Visualize privacy features before sending
- **Built-in Security Features**: Scam protection and suspicious activity detection

## 🛠️ Technologies Used
- **[Stellar SDK](https://github.com/stellar/js-stellar-sdk)**: For transaction creation and account management
- **[Passkeys Kit](https://github.com/kalepail/passkey-kit)**: For passwordless biometric authentication
- **[Launchtube](https://github.com/stellar/launchtube)**: For zero gas transaction experience
- **React**: For UI components and state management
- **TailwindCSS**: For responsive design
- **Polkadot.js API**: For Polkadot network integration

## 📝 Documentation
- [Why PayEasy](./NARRATIVE.md) - Our project narrative and vision
- [Technical Design](./TECHNICAL_DESIGN.md) - Technical architecture and design decisions

## 🔗 Deployed Contracts
- Stellar Testnet Contract: `GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ` ([Stellar Expert Link](https://stellar.expert/explorer/testnet/account/GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ))
- Polkadot Testnet Contract: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` 

## 🖥️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/KIRTIRAJ4327/PayEasy.git
   cd PayEasy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## 🔐 Security Features
- Zero-knowledge proofs for transaction privacy
- WebAuthn integration for secure, passwordless login
- Cross-chain payment obfuscation
- On-device biometric validation
- Real-time scam detection

## 🔄 Development Process

Our experience building on Stellar has been transformative. The combination of Stellar's developer-friendly SDKs and the seamless integration of passkeys has allowed us to create a genuinely Web2-like experience for blockchain payments.

Key development insights:
- Stellar SDK significantly simplified transaction management
- Passkeys Kit eliminated the complexities of wallet creation and login
- Launchtube enabled a true "no gas" experience for end users
- Integration with Polkadot expanded our privacy options while maintaining UX simplicity

## 📦 Repository Structure
- `/components` - React components including PasskeyAuth
- `/services` - Core services for authentication, validation, and blockchain interaction
- `/css` - Styling with TailwindCSS
- `/JS` - JavaScript utilities for privacy and security

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements
- Stellar Development Foundation
- Polkadot Ecosystem
- Stellar Consensus Hackathon 2025 organizers

---

<p align="center">
  <a href="https://developers.stellar.org/">
    <img src="https://i.ibb.co/M6jVRCM/stellar-logo.png" alt="Built on Stellar" width="150"/>
  </a>
</p>
