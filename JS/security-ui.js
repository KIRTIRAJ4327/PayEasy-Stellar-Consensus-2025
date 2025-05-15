/**
 * PayEasy Security UI Module
 * 
 * Handles the user interface for security features:
 * - Status indicators
 * - Security panel
 * - Notification system
 */

class SecurityUI {
    constructor() {
        this.tooltips = {
            zeroKnowledge: `Zero-knowledge proofs allow us to verify transaction validity without exposing your sensitive data. 
                           This means enhanced privacy while maintaining security.`,
            decentralizedId: `Your identity is verified without storing personal information in centralized databases. 
                            This gives you control over your data while ensuring secure transactions.`,
            scamProtection: `We check recipient addresses against known scam databases in real-time. 
                           This helps protect you from fraudulent transactions.`,
            rateLimit: `To prevent abuse, we limit the number of transactions per hour. 
                       This protects both you and the network.`,
            encryption: `Your transaction data is encrypted using session-specific keys. 
                        This adds an extra layer of security to your payments.`
        };

        this.statusIndicators = {
            midnight: { active: false, message: 'Midnight API Status' },
            encryption: { active: false, message: 'Encryption Status' },
            rateLimit: { active: false, message: 'Rate Limit Status' }
        };
    }

    // Initialize security UI elements
    initialize() {
        this.createSecurityPanel();
        this.createTooltips();
        this.createStatusIndicators();
    }

    // Create the main security information panel
    createSecurityPanel() {
        const panel = document.createElement('div');
        panel.className = 'bg-white rounded-lg shadow-md p-4 mb-4';
        panel.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-lg font-semibold text-primary">Security Features</h3>
                <button id="security-info-toggle" class="text-secondary hover:text-primary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </button>
            </div>
            <div id="security-features" class="hidden">
                <div class="space-y-2">
                    <div class="flex items-center">
                        <span class="security-indicator"></span>
                        <span class="ml-2" data-tooltip="zeroKnowledge">Zero-Knowledge Proofs</span>
                    </div>
                    <div class="flex items-center">
                        <span class="security-indicator"></span>
                        <span class="ml-2" data-tooltip="decentralizedId">Decentralized Identity</span>
                    </div>
                    <div class="flex items-center">
                        <span class="security-indicator"></span>
                        <span class="ml-2" data-tooltip="scamProtection">Scam Protection</span>
                    </div>
                    <div class="flex items-center">
                        <span class="security-indicator"></span>
                        <span class="ml-2" data-tooltip="rateLimit">Rate Limiting</span>
                    </div>
                    <div class="flex items-center">
                        <span class="security-indicator"></span>
                        <span class="ml-2" data-tooltip="encryption">Session Encryption</span>
                    </div>
                </div>
            </div>
        `;

        // Insert panel before the payment form
        const form = document.querySelector('#payment-form');
        form.parentNode.insertBefore(panel, form);

        // Toggle security features visibility
        document.getElementById('security-info-toggle').addEventListener('click', () => {
            const features = document.getElementById('security-features');
            features.classList.toggle('hidden');
        });
    }

    // Create tooltips for security features
    createTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            const tooltipKey = element.getAttribute('data-tooltip');
            const tooltipText = this.tooltips[tooltipKey];

            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'absolute bg-gray-900 text-white p-2 rounded text-sm max-w-xs z-50';
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
                tooltip.textContent = tooltipText;
                document.body.appendChild(tooltip);

                element.addEventListener('mouseleave', () => {
                    tooltip.remove();
                });
            });
        });
    }

    // Create and update security status indicators
    createStatusIndicators() {
        const indicators = document.querySelectorAll('.security-indicator');
        indicators.forEach(indicator => {
            this.updateIndicator(indicator, false);
        });
    }

    // Update a single security feature status
    updateFeatureStatus(feature, isActive, message = '') {
        if (this.statusIndicators[feature]) {
            this.statusIndicators[feature].active = isActive;
            this.statusIndicators[feature].message = message || this.statusIndicators[feature].message;
            this.updateStatusDisplay();
        }
    }

    // Update the visual status of an indicator
    updateIndicator(indicator, isActive) {
        indicator.className = `security-indicator inline-block w-3 h-3 rounded-full ${
            isActive ? 'bg-green-500' : 'bg-gray-300'
        }`;
    }

    // Show a security-related notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            type === 'error' ? 'bg-red-500' : 'bg-primary'
        } text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Update all status indicators
    updateStatusDisplay() {
        const indicators = document.querySelectorAll('.security-indicator');
        Object.values(this.statusIndicators).forEach((status, index) => {
            if (indicators[index]) {
                this.updateIndicator(indicators[index], status.active);
            }
        });
    }
}

// Export the SecurityUI class for ES modules
export default SecurityUI; 