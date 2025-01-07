// Import utilities
import { initializeCommon } from './js/utils.js';

class SettingsManager {
    constructor() {
        this.initializeEventListeners();
        this.loadSettings();
        initializeCommon(); // Initialize common elements including footer
    }

    initializeEventListeners() {
        // Account Settings Form
        const accountForm = document.getElementById('account-settings-form');
        if (accountForm) {
            accountForm.addEventListener('submit', (e) => this.handleAccountSettingsSubmit(e));
        }

        // Theme Settings
        const themeInputs = document.querySelectorAll('input[name="theme"]');
        themeInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleThemeChange(e));
        });

        // Color Scheme Settings
        const colorInputs = document.querySelectorAll('input[name="color"]');
        colorInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleColorSchemeChange(e));
        });

        // Notification Toggles
        const notificationToggles = document.querySelectorAll('.toggle');
        notificationToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => this.handleNotificationToggle(e));
        });
    }

    loadSettings() {
        // Load theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Load color scheme
        const savedColor = localStorage.getItem('colorScheme') || 'blue';
        document.querySelector(`input[name="color"][value="${savedColor}"]`).checked = true;

        // Load notification preferences
        const notifications = JSON.parse(localStorage.getItem('notifications')) || {
            email: true,
            desktop: true,
            leaveUpdates: true,
            teamUpdates: true
        };
        this.updateNotificationToggles(notifications);

        // Load work schedule
        this.loadWorkSchedule();

        // Load privacy settings
        this.loadPrivacySettings();
    }

    handleAccountSettingsSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const phone = formData.get('phone');
        const currentPassword = formData.get('current-password');
        const newPassword = formData.get('new-password');

        // Here you would typically make an API call to update the account settings
        // For now, we'll just show a success message
        this.showToast('Account settings updated successfully');
    }

    handleThemeChange(e) {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    handleColorSchemeChange(e) {
        const color = e.target.value;
        localStorage.setItem('colorScheme', color);
        // Here you would typically update the CSS variables or classes for the color scheme
    }

    handleNotificationToggle(e) {
        const type = e.target.dataset.type;
        const isEnabled = e.target.checked;
        const notifications = JSON.parse(localStorage.getItem('notifications')) || {};
        notifications[type] = isEnabled;
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    updateNotificationToggles(notifications) {
        Object.entries(notifications).forEach(([type, enabled]) => {
            const toggle = document.querySelector(`[data-type="${type}"]`);
            if (toggle) {
                toggle.checked = enabled;
            }
        });
    }

    loadWorkSchedule() {
        const schedule = JSON.parse(localStorage.getItem('workSchedule')) || {
            startTime: '09:00',
            endTime: '17:00',
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            timeZone: 'UTC+5:30'
        };

        // Set work hours
        document.querySelector('input[type="time"][value="09:00"]').value = schedule.startTime;
        document.querySelector('input[type="time"][value="17:00"]').value = schedule.endTime;

        // Set working days
        schedule.workingDays.forEach(day => {
            const checkbox = document.querySelector(`input[type="checkbox"][value="${day}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // Set timezone
        const timezoneSelect = document.querySelector('select');
        if (timezoneSelect) {
            timezoneSelect.value = schedule.timeZone;
        }
    }

    loadPrivacySettings() {
        const privacy = JSON.parse(localStorage.getItem('privacy')) || {
            profileVisibility: true,
            onlineStatus: true,
            activityStatus: true
        };

        Object.entries(privacy).forEach(([setting, enabled]) => {
            const toggle = document.querySelector(`[data-privacy="${setting}"]`);
            if (toggle) {
                toggle.checked = enabled;
            }
        });
    }

    deleteAccount() {
        const confirmationInput = document.getElementById('delete-confirmation');
        if (confirmationInput.value === 'DELETE') {
            // Here you would typically make an API call to delete the account
            // For now, we'll just show a message and redirect
            this.showToast('Account deleted successfully');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            this.showToast('Please type "DELETE" to confirm account deletion', 'error');
        }
    }

    showToast(message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} fixed bottom-4 right-4 z-50`;
        toast.textContent = message;

        // Add to document
        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager();

// Export for use in other modules
export default settingsManager;
