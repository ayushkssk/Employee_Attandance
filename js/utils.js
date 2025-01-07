// Utility functions for the application

// Load footer into any page that includes this script
export async function loadFooter() {
    try {
        const footerContainer = document.getElementById('footer-container');
        if (footerContainer) {
            const response = await fetch('footer.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const footerHtml = await response.text();
            footerContainer.innerHTML = footerHtml;
            console.log('Footer loaded successfully');
        } else {
            console.error('Footer container not found');
        }
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// Initialize common elements across pages
export function initializeCommon() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Initializing common elements');
        loadFooter();
    });
}

// Export other utility functions as needed
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

export const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date);
};
