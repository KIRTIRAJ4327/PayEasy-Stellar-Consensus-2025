#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod payment_contract {
    use ink_prelude::string::String;
    use ink_prelude::vec::Vec;
    use ink_storage::{
        traits::SpreadAllocate,
        Mapping,
    };

    /// The payment contract data structure.
    #[ink(storage)]
    #[derive(SpreadAllocate)]
    pub struct PaymentContract {
        /// Contract owner
        owner: AccountId,
        /// Mapping from users to their payment history
        payments: Mapping<AccountId, Vec<Payment>>,
        /// Total number of payments processed
        payment_count: u128,
    }

    /// A payment record
    #[derive(Debug, scale::Encode, scale::Decode, PartialEq, Eq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Payment {
        /// Payment ID
        id: u128,
        /// Sender account
        sender: AccountId,
        /// Recipient account
        recipient: AccountId,
        /// Payment amount
        amount: Balance,
        /// Optional payment description
        description: Option<String>,
        /// Timestamp of the payment
        timestamp: u64,
    }

    /// Payment creation event
    #[ink(event)]
    pub struct PaymentCreated {
        #[ink(topic)]
        payment_id: u128,
        #[ink(topic)]
        sender: AccountId,
        #[ink(topic)]
        recipient: AccountId,
        amount: Balance,
        timestamp: u64,
    }

    /// Errors that can occur during contract execution
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Insufficient balance for payment
        InsufficientBalance,
        /// Caller is not the contract owner
        NotOwner,
        /// Payment failed
        PaymentFailed,
        /// Invalid payment amount (zero or negative)
        InvalidAmount,
    }

    /// Type alias for the contract's result type
    pub type Result<T> = core::result::Result<T, Error>;

    impl PaymentContract {
        /// Constructor to initialize the payment contract
        #[ink(constructor)]
        pub fn new() -> Self {
            // Create and initialize the contract with default values
            ink_lang::utils::initialize_contract(|contract: &mut Self| {
                contract.owner = Self::env().caller();
                contract.payment_count = 0;
            })
        }

        /// Send a payment to a recipient
        #[ink(message, payable)]
        pub fn send_payment(&mut self, recipient: AccountId, description: Option<String>) -> Result<u128> {
            let sender = self.env().caller();
            let amount = self.env().transferred_value();
            let block_timestamp = self.env().block_timestamp();

            // Validate the payment amount
            if amount <= 0 {
                return Err(Error::InvalidAmount);
            }

            // Create the payment record
            let payment_id = self.payment_count + 1;
            let payment = Payment {
                id: payment_id,
                sender,
                recipient,
                amount,
                description,
                timestamp: block_timestamp,
            };

            // Transfer the funds to the recipient
            if self.env().transfer(recipient, amount).is_err() {
                return Err(Error::PaymentFailed);
            }

            // Record the payment in the sender's history
            let mut sender_payments = self.payments.get(sender).unwrap_or_default();
            sender_payments.push(payment.clone());
            self.payments.insert(sender, &sender_payments);

            // Record the payment in the recipient's history
            let mut recipient_payments = self.payments.get(recipient).unwrap_or_default();
            recipient_payments.push(payment.clone());
            self.payments.insert(recipient, &recipient_payments);

            // Increment the payment counter
            self.payment_count += 1;

            // Emit the payment event
            self.env().emit_event(PaymentCreated {
                payment_id,
                sender,
                recipient,
                amount,
                timestamp: block_timestamp,
            });

            Ok(payment_id)
        }

        /// Get a user's payment history
        #[ink(message)]
        pub fn get_payment_history(&self, user: AccountId) -> Vec<Payment> {
            self.payments.get(user).unwrap_or_default()
        }

        /// Get the total number of payments processed
        #[ink(message)]
        pub fn get_payment_count(&self) -> u128 {
            self.payment_count
        }

        /// Get the contract owner
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_lang as ink;

        #[ink::test]
        fn test_send_payment() {
            // Create the contract
            let mut contract = PaymentContract::new();
            
            // Get default accounts
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set the contract caller as accounts.alice
            let alice = accounts.alice;
            let bob = accounts.bob;
            
            // Set the contract balance
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(alice);
            ink_env::test::set_value_transferred::<ink_env::DefaultEnvironment>(100);
            
            // Send a payment from Alice to Bob
            let payment_id = contract.send_payment(bob, Some(String::from("Test payment"))).unwrap();
            
            // Check that the payment ID is correct
            assert_eq!(payment_id, 1);
            
            // Check that the payment was stored correctly
            let alice_payments = contract.get_payment_history(alice);
            assert_eq!(alice_payments.len(), 1);
            assert_eq!(alice_payments[0].sender, alice);
            assert_eq!(alice_payments[0].recipient, bob);
            assert_eq!(alice_payments[0].amount, 100);
            assert_eq!(alice_payments[0].description, Some(String::from("Test payment")));
            
            // Check that the payment count was incremented
            assert_eq!(contract.get_payment_count(), 1);
        }
    }
} 