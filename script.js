import colleaguesManager from './colleagues.js';
import { initializeCommon } from './js/utils.js';

// Initialize common elements including footer
document.addEventListener('DOMContentLoaded', function() {
    initializeCommon();
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            document.documentElement.setAttribute('data-theme', 
                this.checked ? 'dark' : 'light'
            );
        });
    }

    const circle = document.querySelector('.progress-ring-circle');
    const timeDisplay = document.getElementById('timeLeft');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    // Set the initial stroke properties
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    function setProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    function updateTimer() {
        const now = new Date();
        const start = new Date(now);
        const end = new Date(now);
        
        // Set office hours
        start.setHours(10, 0, 0, 0);
        end.setHours(20, 0, 0, 0);

        // Calculate total office duration in milliseconds
        const totalDuration = end - start;
        
        // Calculate remaining time
        let timeLeft;
        if (now < start) {
            timeLeft = 0;
        } else if (now > end) {
            timeLeft = 0;
        } else {
            timeLeft = end - now;
        }

        // Calculate progress percentage
        const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
        setProgress(progress);

        // Format time display
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Update every second
    setInterval(updateTimer, 1000);
    updateTimer(); // Initial update

    // Theme toggle functionality
    function initializeTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-mode', theme === 'dark');
        updateThemeIcon();
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon();
    }

    function updateThemeIcon() {
        const themeIcon = document.querySelector('#theme-toggle i');
        const isDark = document.body.classList.contains('dark-mode');
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 
                        type === 'error' ? 'fas fa-exclamation-circle' : 
                        'fas fa-info-circle';
        
        const text = document.createElement('span');
        text.textContent = message;
        
        notification.appendChild(icon);
        notification.appendChild(text);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function showNotifications() {
        const notifications = colleaguesManager.getNotifications();
        const container = document.createElement('div');
        container.className = 'menu dropdown-content z-[1] bg-base-100 rounded-box w-96 shadow-lg p-2';
        container.style.position = 'absolute';
        container.style.right = '0';
        container.style.top = '100%';

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    No notifications
                </div>
            `;
        } else {
            container.innerHTML = notifications.map(notification => `
                <div class="notification-item p-3 hover:bg-base-200 rounded-lg ${notification.read ? 'opacity-50' : ''}" 
                     data-id="${notification.id}">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold">${notification.title}</h4>
                            <p class="text-sm">${notification.message}</p>
                            <span class="text-xs opacity-50">
                                ${new Date(notification.timestamp).toLocaleString()}
                            </span>
                        </div>
                        ${!notification.read ? `
                            <button class="btn btn-ghost btn-xs mark-read" data-id="${notification.id}">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        return container;
    }

    // Initialize components
    initializeTheme();
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Notifications button
    document.getElementById('notifications-btn').addEventListener('click', (e) => {
        const existingDropdown = document.querySelector('.notifications-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }

        const container = showNotifications();
        container.classList.add('notifications-dropdown');
        e.currentTarget.parentNode.appendChild(container);

        // Handle mark as read
        container.addEventListener('click', (event) => {
            const markReadBtn = event.target.closest('.mark-read');
            if (markReadBtn) {
                const id = parseInt(markReadBtn.dataset.id);
                colleaguesManager.markNotificationAsRead(id);
                container.remove();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', function closeNotifications(e) {
            if (!container.contains(e.target) && !e.target.closest('#notifications-btn')) {
                container.remove();
                document.removeEventListener('click', closeNotifications);
            }
        });
    });

    // Initialize the attendance manager
    const checkInBtn = document.getElementById('checkInButton');
    const checkOutBtn = document.getElementById('checkOutButton');
    const timeDisplay = document.getElementById('currentTime');
    const dateDisplay = document.getElementById('currentDate');

    // Initialize local storage if not exists
    if (!localStorage.getItem('attendance_status')) {
        localStorage.setItem('attendance_status', 'out');
    }

    // Update button states based on current status
    function updateButtonStates() {
        const status = localStorage.getItem('attendance_status');
        checkInBtn.disabled = status === 'in';
        checkOutBtn.disabled = status === 'out';
    }

    // Update time and date
    function updateDateTime() {
        const now = new Date();
        if (timeDisplay) {
            timeDisplay.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        if (dateDisplay) {
            dateDisplay.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Handle check in
    checkInBtn.addEventListener('click', () => {
        const timestamp = new Date().toISOString();
        const attendance = JSON.parse(localStorage.getItem('attendance_records') || '[]');
        
        attendance.push({
            checkIn: timestamp,
            checkOut: null
        });
        
        localStorage.setItem('attendance_records', JSON.stringify(attendance));
        localStorage.setItem('attendance_status', 'in');
        
        // Add timeline entry
        addTimelineEntry('check-in', timestamp);
        
        // Update UI
        updateButtonStates();
        updateStats();
        
        // Show success message
        showAlert('Checked in successfully!', 'success');
    });

    // Handle check out
    checkOutBtn.addEventListener('click', () => {
        const timestamp = new Date().toISOString();
        const attendance = JSON.parse(localStorage.getItem('attendance_records') || '[]');
        
        if (attendance.length > 0) {
            const lastRecord = attendance[attendance.length - 1];
            if (!lastRecord.checkOut) {
                lastRecord.checkOut = timestamp;
                localStorage.setItem('attendance_records', JSON.stringify(attendance));
                localStorage.setItem('attendance_status', 'out');
                
                // Add timeline entry
                addTimelineEntry('check-out', timestamp);
                
                // Update UI
                updateButtonStates();
                updateStats();
                
                // Show success message
                showAlert('Checked out successfully!', 'success');
            }
        }
    });

    // Add timeline entry
    function addTimelineEntry(type, timestamp) {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;

        const entry = document.createElement('div');
        entry.className = 'timeline-item flex gap-4 mb-4';
        entry.innerHTML = `
            <div class="avatar placeholder">
                <div class="bg-primary text-primary-content rounded-full w-12">
                    <i class="fas fa-sign-${type === 'check-in' ? 'in' : 'out'}-alt"></i>
                </div>
            </div>
            <div>
                <h4 class="font-bold">${type === 'check-in' ? 'Check In' : 'Check Out'}</h4>
                <p class="text-sm">${new Date(timestamp).toLocaleTimeString()}</p>
                <span class="text-xs">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    Office Location
                </span>
            </div>
        `;

        timeline.insertBefore(entry, timeline.firstChild);
    }

    // Show alert message
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} fixed top-4 right-4 w-auto`;
        alert.innerHTML = `
            <span>${message}</span>
        `;
        document.body.appendChild(alert);
        
        // Remove alert after 3 seconds
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    // Update statistics
    function updateStats() {
        const attendance = JSON.parse(localStorage.getItem('attendance_records') || '[]');
        const todayHours = document.getElementById('todayHours');
        const weekAttendance = document.getElementById('weekAttendance');
        const avgTime = document.getElementById('avgTime');

        if (todayHours) {
            const today = new Date().toDateString();
            const todayRecords = attendance.filter(record => 
                new Date(record.checkIn).toDateString() === today
            );
            
            let totalMinutes = 0;
            todayRecords.forEach(record => {
                if (record.checkOut) {
                    totalMinutes += (new Date(record.checkOut) - new Date(record.checkIn)) / (1000 * 60);
                } else {
                    totalMinutes += (new Date() - new Date(record.checkIn)) / (1000 * 60);
                }
            });

            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.round(totalMinutes % 60);
            todayHours.textContent = `${hours}h ${minutes}m`;
        }

        // Update other stats as needed
    }

    // Initialize
    updateDateTime();
    updateButtonStates();
    updateStats();
    
    // Update time every second
    setInterval(updateDateTime, 1000);
});