/**
 * PayEasy Privacy Score Visualization
 * 
 * Provides a visual indicator of transaction privacy based on
 * enabled Midnight Protocol features.
 */

class PrivacyScoreManager {
    constructor() {
        this.features = {
            zeroKnowledge: false,
            decentralizedId: true, // Always enabled in demo
            scamProtection: false,
            rateLimiting: false,
            sessionEncryption: false
        };
        this.scoreElement = document.getElementById('privacy-score');
        this.scoreDescriptionElement = document.getElementById('privacy-score-description');
        
        // Initialize toggle event listeners
        this.initToggles();
        
        // Initial score calculation
        this.updateScore();
    }
    
    initToggles() {
        // Connect UI toggles to feature settings
        const toggles = {
            'toggle-zero-knowledge': 'zeroKnowledge',
            'toggle-scam-protection': 'scamProtection',
            'toggle-rate-limiting': 'rateLimiting',
            'toggle-encryption': 'sessionEncryption'
        };
        
        Object.entries(toggles).forEach(([elementId, featureKey]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.checked = this.features[featureKey];
                element.addEventListener('change', (e) => {
                    this.features[featureKey] = e.target.checked;
                    this.updateScore();
                });
            }
        });
    }
    
    updateScore() {
        // Calculate privacy score
        const enabledFeatures = Object.values(this.features).filter(v => v).length;
        const totalFeatures = Object.values(this.features).length;
        const percentage = Math.round((enabledFeatures / totalFeatures) * 100);
        
        // Update UI
        if (this.scoreElement) {
            this.scoreElement.textContent = percentage + '%';
            
            // Update color and description based on score
            if (percentage >= 80) {
                this.scoreElement.className = 'text-green-600 font-bold text-xl';
                this.setDescription('Enhanced Privacy');
            } else if (percentage >= 60) {
                this.scoreElement.className = 'text-blue-600 font-bold text-xl';
                this.setDescription('Balanced Privacy');
            } else if (percentage >= 40) {
                this.scoreElement.className = 'text-yellow-600 font-bold text-xl';
                this.setDescription('Basic Privacy');
            } else {
                this.scoreElement.className = 'text-red-600 font-bold text-xl';
                this.setDescription('Minimal Privacy');
            }
        }
        
        // Dispatch event for other components to react
        document.dispatchEvent(new CustomEvent('privacy-score-updated', { 
            detail: { score: percentage, features: {...this.features} }
        }));
    }
    
    setDescription(text) {
        if (this.scoreDescriptionElement) {
            this.scoreDescriptionElement.textContent = text;
        }
    }
    
    // Activate demo mode with preset features
    activateDemo() {
        this.features = {
            zeroKnowledge: true,
            decentralizedId: true,
            scamProtection: true,
            rateLimiting: true,
            sessionEncryption: true
        };
        
        // Update UI toggles
        Object.entries(this.features).forEach(([feature, value]) => {
            const element = document.getElementById(`toggle-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            if (element) {
                element.checked = value;
            }
        });
        
        this.updateScore();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.privacyScoreManager = new PrivacyScoreManager();
    
    // Setup demo mode button
    const demoButton = document.getElementById('demo-mode');
    if (demoButton) {
        demoButton.addEventListener('click', () => {
            window.privacyScoreManager.activateDemo();
            // Pre-fill form with demo values
            prefillDemoValues();
        });
    }
});

// Helper function to pre-fill form fields for demo
function prefillDemoValues() {
    const demoData = {
        'recipient-address': 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
        'amount': '100',
        'memo': 'PayEasy Demo Transaction'
    };
    
    Object.entries(demoData).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
} 