/**
 * PayEasy Transaction Privacy Options
 * 
 * Provides UI controls for configuring transaction privacy settings
 * using the Midnight Protocol layer.
 */

class TransactionPrivacyManager {
    constructor() {
        this.privacyOptions = {
            hideAmount: false,
            obscureRecipient: false,
            preventTracking: false,
            metadataProtection: false
        };
        
        // Initialize UI elements
        this.initUI();
        
        // Subscribe to privacy score updates
        document.addEventListener('privacy-score-updated', (event) => {
            this.onPrivacyScoreUpdated(event.detail);
        });
    }
    
    initUI() {
        // Set up privacy option toggles
        const toggles = {
            'toggle-hide-amount': 'hideAmount',
            'toggle-obscure-recipient': 'obscureRecipient',
            'toggle-prevent-tracking': 'preventTracking',
            'toggle-metadata-protection': 'metadataProtection'
        };
        
        Object.entries(toggles).forEach(([elementId, optionKey]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.checked = this.privacyOptions[optionKey];
                element.addEventListener('change', (e) => {
                    this.privacyOptions[optionKey] = e.target.checked;
                    this.updateUI();
                });
            }
        });
        
        // Initialize privacy visualization
        this.updateUI();
    }
    
    updateUI() {
        // Update transaction preview based on privacy settings
        this.updateTransactionPreview();
        
        // Update available options based on enabled security features
        this.updateAvailableOptions();
        
        // Dispatch event about privacy option changes
        document.dispatchEvent(new CustomEvent('privacy-options-updated', {
            detail: { options: {...this.privacyOptions} }
        }));
    }
    
    updateTransactionPreview() {
        // Elements to update in the preview
        const elements = {
            'preview-amount': this.privacyOptions.hideAmount ? '***.**' : '100.00',
            'preview-recipient': this.privacyOptions.obscureRecipient ? 'G****BZ' : 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
            'preview-memo': this.privacyOptions.metadataProtection ? '(Protected)' : 'PayEasy Demo Transaction'
        };
        
        // Update each element if it exists
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Update privacy badge
        const enabledOptions = Object.values(this.privacyOptions).filter(v => v).length;
        const privacyBadge = document.getElementById('privacy-badge');
        if (privacyBadge) {
            if (enabledOptions >= 3) {
                privacyBadge.textContent = 'Enhanced Privacy';
                privacyBadge.className = 'bg-green-600 text-white px-2 py-1 rounded text-sm';
            } else if (enabledOptions >= 1) {
                privacyBadge.textContent = 'Basic Privacy';
                privacyBadge.className = 'bg-yellow-600 text-white px-2 py-1 rounded text-sm';
            } else {
                privacyBadge.textContent = 'Standard';
                privacyBadge.className = 'bg-gray-600 text-white px-2 py-1 rounded text-sm';
            }
        }
    }
    
    updateAvailableOptions() {
        // This would normally be based on enabled security features
        // For demo purposes, all options are available
    }
    
    onPrivacyScoreUpdated(detail) {
        // Enable/disable options based on security features
        const { features } = detail;
        
        // Map security features to privacy options
        const optionAvailability = {
            'toggle-hide-amount': features.zeroKnowledge,
            'toggle-obscure-recipient': features.decentralizedId,
            'toggle-prevent-tracking': features.scamProtection,
            'toggle-metadata-protection': features.sessionEncryption
        };
        
        // Update UI based on feature availability
        Object.entries(optionAvailability).forEach(([elementId, isAvailable]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.disabled = !isAvailable;
                
                // Update the label to show availability
                const label = document.querySelector(`label[for="${elementId}"]`);
                if (label) {
                    if (!isAvailable) {
                        label.classList.add('text-gray-400');
                        label.classList.remove('text-gray-700');
                    } else {
                        label.classList.remove('text-gray-400');
                        label.classList.add('text-gray-700');
                    }
                }
            }
        });
    }
    
    // Enable all privacy options for demo
    activateDemo() {
        Object.keys(this.privacyOptions).forEach(key => {
            this.privacyOptions[key] = true;
        });
        
        // Update UI toggles
        Object.entries(this.privacyOptions).forEach(([option, value]) => {
            const elementId = `toggle-${option.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            const element = document.getElementById(elementId);
            if (element) {
                element.checked = value;
            }
        });
        
        this.updateUI();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.transactionPrivacyManager = new TransactionPrivacyManager();
    
    // Connect to demo mode button
    const demoButton = document.getElementById('demo-mode');
    if (demoButton) {
        demoButton.addEventListener('click', () => {
            window.transactionPrivacyManager.activateDemo();
        });
    }
}); 