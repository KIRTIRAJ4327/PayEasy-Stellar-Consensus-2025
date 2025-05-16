# PayEasy Technical Design Documentation

## Overview

PayEasy is a web-based payment platform that leverages Stellar and Polkadot blockchain technologies to provide a Web2-like user experience for cryptocurrency transactions. The system uses passkeys for seamless authentication, smart contracts for transaction processing, and cross-chain operations for enhanced functionality.

## System Architecture

![System Architecture](https://i.ibb.co/ZVJrPFV/payeasy-architecture.png)

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Application                      │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   UI Layer   │───>│  Auth Service │───>│  Transaction  │  │
│  └─────────────┘    └──────────────┘    │    Service     │  │
│        │                                 └───────────────┘  │
│        │                                        │           │
└────────┼────────────────────────────────────────┼───────────┘
         │                                        │
         ▼                                        ▼
┌──────────────────┐                    ┌─────────────────────┐
│  Passkey Service │                    │  Blockchain Service │
└──────────────────┘                    └─────────────────────┘
         │                                        │
         │                                        │
         ▼                                        │
┌──────────────────┐                             │
│  WebAuthn API    │                             │
└──────────────────┘                             │
                                                 │
                           ┌─────────────────────┼─────────────┐
                           │                     │             │
                           ▼                     ▼             ▼
                    ┌─────────────┐     ┌──────────────┐  ┌──────────┐
                    │ Stellar API │     │ Polkadot API │  │ Launchtube│
                    └─────────────┘     └──────────────┘  └──────────┘
```

## Major Components

### 1. UI Layer
- **Purpose**: Provides the user interface for registration, authentication, and transaction management
- **Implementation**: React components styled with TailwindCSS
- **Key Features**: Responsive design, progressive disclosure of blockchain elements, real-time feedback

### 2. Auth Service
- **Purpose**: Manages user authentication and session state
- **Implementation**: Integration with WebAuthn API via Passkeys Kit
- **Key Features**: Biometric authentication, credential management, session persistence

### 3. Transaction Service
- **Purpose**: Handles the creation, signing, and submission of blockchain transactions
- **Implementation**: JavaScript service utilizing Stellar SDK and Polkadot.js
- **Key Features**: Transaction builder, fee estimation, confirmation tracking, error handling

### 4. Passkey Service
- **Purpose**: Manages the creation and authentication of passkeys
- **Implementation**: WebAuthn API wrapper using Passkeys Kit
- **Key Features**: Device-bound credentials, biometric validation, credential storage

### 5. Blockchain Service
- **Purpose**: Interfaces with blockchain networks
- **Implementation**: Abstractions over Stellar and Polkadot APIs
- **Key Features**: Network status monitoring, transaction submission, account management

## Interaction Flow

1. **User Registration**:
   - User initiates registration
   - System prompts for device biometrics via WebAuthn
   - Passkey is created and linked to a new smart wallet
   - Smart wallet contract is deployed to Stellar and linked to Polkadot parachain

2. **User Authentication**:
   - User enters login screen and clicks "Login"
   - System requests biometric verification
   - Upon successful verification, the user's smart wallet is activated
   - Authentication token is stored for the session

3. **Transaction Flow**:
   - User inputs recipient address and amount
   - System validates inputs and displays confirmation
   - User approves with biometric verification
   - Transaction is built, signed with the passkey, and submitted
   - Launchtube handles gas fees transparently
   - UI displays confirmation and transaction details

## Design Choices

### Storage Strategy

1. **Local Storage**:
   - Authentication session tokens
   - User preferences and UI state
   - Recent transaction history (encrypted)

2. **Smart Contract Storage**:
   - User account details
   - Transaction history references
   - Authorization policies

3. **Indexer Storage**:
   - Transaction records for quick retrieval
   - Analytics data in anonymized form

### Contract State Management

1. **Smart Wallet Contract**:
   - Stores: User public key, transaction history hashes, authorization rules
   - Updates: When transactions occur or authorization rules change
   - Access Control: Only authorized via passkey verification

2. **Payment Contract**:
   - Stores: Transaction parameters, execution status, cross-chain references
   - Updates: When payment is initiated, in process, completed, or failed
   - Access Control: Public for verification, restricted for execution

### Events Emitted

1. **Authentication Events**:
   - `UserRegistered`: When a new user registers
   - `UserAuthenticated`: When a user successfully logs in
   - `SessionExpired`: When a user's session expires

2. **Transaction Events**:
   - `TransactionInitiated`: When a user starts a transaction
   - `TransactionSigned`: When a transaction is signed
   - `TransactionSubmitted`: When a transaction is sent to the network
   - `TransactionConfirmed`: When a transaction is confirmed on-chain
   - `CrossChainBridgeInitiated`: When a cross-chain transaction begins

3. **Error Events**:
   - `ValidationError`: When transaction data is invalid
   - `NetworkError`: When blockchain network issues occur
   - `AuthenticationError`: When passkey verification fails

## Passkeys Implementation

Our passkey implementation leverages WebAuthn and the Stellar Passkeys Kit to create a seamless authentication experience:

1. **Registration Process**:
   - Generate a new user account with unique identifier
   - Create WebAuthn credential bound to user's device
   - Generate Stellar keypair from WebAuthn credential
   - Deploy smart wallet contract with the user's public key
   - Store credential ID and public key mapping

2. **Authentication Process**:
   - Request biometric verification from user's device
   - Validate credential against stored credential ID
   - Derive Stellar keypair from credential for transaction signing
   - Create authenticated session

3. **Transaction Signing**:
   - Prepare transaction with Stellar SDK
   - Present transaction details to user
   - Request biometric verification for approval
   - Sign transaction with derived keypair
   - Submit to network

4. **Security Advantages**:
   - Private keys never leave the user's device
   - Biometric verification required for all sensitive operations
   - No seed phrases to manage or lose
   - Phishing resistant by design (domain binding)

## Cross-Chain Implementation

PayEasy implements cross-chain functionality between Stellar and Polkadot through:

1. **Bridge Contracts**:
   - Stellar Contract: Locks assets and emits events
   - Polkadot Contract: Monitors events and mints corresponding assets

2. **Transaction Flow**:
   - User initiates cross-chain transaction in UI
   - Source chain transaction created and signed
   - Bridge contract locks assets on source chain
   - Bridge validator nodes verify transaction
   - Target chain contract releases/mints assets
   - UI updates with confirmation from both chains

3. **Security Measures**:
   - Multi-signature verification for bridge operations
   - Time-locked transactions to prevent double-spending
   - Threshold signatures for validator consensus
   - Circuit breakers for unusual activity

## Challenges Overcome

### 1. Passkey Integration with Blockchain

**Challenge**: Integrating WebAuthn credentials with blockchain key management  
**Solution**: Developed a deterministic derivation path from WebAuthn credentials to Stellar keypairs, allowing seamless authentication while maintaining security.

### 2. Cross-Chain Transaction Consistency

**Challenge**: Ensuring transaction finality across different blockchain networks  
**Solution**: Implemented a two-phase commit protocol with rollback capabilities and transaction monitoring to maintain consistency between Stellar and Polkadot transactions.

### 3. Gas Fee Abstraction

**Challenge**: Hiding gas fees from users without compromising transaction security  
**Solution**: Integrated Launchtube to sponsor transaction fees while implementing rate limiting and abuse prevention measures.

### 4. UX Simplification

**Challenge**: Simplifying blockchain complexity without sacrificing functionality  
**Solution**: Developed progressive disclosure UI patterns that reveal technical details only when needed, with sensible defaults for most operations.

### 5. Error Handling Across Chains

**Challenge**: Providing unified error handling for multi-chain operations  
**Solution**: Created a standardized error taxonomy and recovery procedures that work across both Stellar and Polkadot networks, with user-friendly error messages.

## Future Enhancements

1. **Multi-Device Support**:
   - Synchronize passkeys across user devices
   - Implement recovery mechanisms for lost devices

2. **Advanced Privacy Features**:
   - Zero-knowledge proof integration for transaction privacy
   - Confidential asset transfers

3. **Expanded Cross-Chain Support**:
   - Integration with additional blockchain networks
   - Atomic swap capabilities for cross-chain asset exchange

4. **Smart Contract Templates**:
   - User-configurable payment conditions
   - Recurring payment capabilities
   - Conditional transfers based on external events

5. **Enhanced Analytics**:
   - Privacy-preserving transaction analytics
   - Personalized spending insights
   - Fraud detection algorithms 