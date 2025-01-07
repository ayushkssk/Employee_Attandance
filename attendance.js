// Attendance management class
class AttendanceManager {
    constructor() {
        this.storage = window.localStorage;
        this.initializeStorage();
        this.bindEvents();
        this.updateUI();
        this.startTimeUpdater();
    }

    initializeStorage() {
        if (!this.storage.getItem('attendance')) {
            this.storage.setItem('attendance', JSON.stringify([]));
        }
        if (!this.storage.getItem('currentSession')) {
            this.storage.setItem('currentSession', JSON.stringify(null));
        }
    }

    bindEvents() {
        const checkInBtn = document.getElementById('checkInButton');
        const checkOutBtn = document.getElementById('checkOutButton');

        if (checkInBtn) {
            checkInBtn.addEventListener('click', () => this.checkIn());
        }
        if (checkOutBtn) {
            checkOutBtn.addEventListener('click', () => this.checkOut());
        }

        // Theme toggler
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => {
                document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
            });
        }
    }

    async checkIn() {
        try {
            const position = await this.getCurrentPosition();
            const timestamp = new Date().toISOString();
            const session = {
                checkIn: timestamp,
                checkInLocation: position,
                checkOut: null,
                checkOutLocation: null
            };

            this.storage.setItem('currentSession', JSON.stringify(session));
            this.updateUI();
            this.addTimelineEntry('check-in', timestamp, position);
            this.toggleButtons(true);
        } catch (error) {
            console.error('Error during check-in:', error);
            alert('Failed to check in. Please ensure location services are enabled.');
        }
    }

    async checkOut() {
        try {
            const position = await this.getCurrentPosition();
            const timestamp = new Date().toISOString();
            const currentSession = JSON.parse(this.storage.getItem('currentSession'));

            if (currentSession) {
                currentSession.checkOut = timestamp;
                currentSession.checkOutLocation = position;

                const attendance = JSON.parse(this.storage.getItem('attendance'));
                attendance.push(currentSession);
                this.storage.setItem('attendance', JSON.stringify(attendance));
                this.storage.setItem('currentSession', JSON.stringify(null));

                this.updateUI();
                this.addTimelineEntry('check-out', timestamp, position);
                this.toggleButtons(false);
            }
        } catch (error) {
            console.error('Error during check-out:', error);
            alert('Failed to check out. Please ensure location services are enabled.');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                error => {
                    reject(error);
                }
            );
        });
    }

    toggleButtons(isCheckedIn) {
        const checkInBtn = document.getElementById('checkInButton');
        const checkOutBtn = document.getElementById('checkOutButton');

        if (checkInBtn && checkOutBtn) {
            checkInBtn.disabled = isCheckedIn;
            checkOutBtn.disabled = !isCheckedIn;
        }
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    addTimelineEntry(type, timestamp, location) {
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
                <p class="text-sm opacity-75">${this.formatTime(timestamp)}</p>
                <span class="text-xs">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    ${location ? 'Office Location' : 'Location unavailable'}
                </span>
            </div>
        `;

        timeline.insertBefore(entry, timeline.firstChild);
    }

    calculateStats() {
        const attendance = JSON.parse(this.storage.getItem('attendance')) || [];
        const currentSession = JSON.parse(this.storage.getItem('currentSession'));

        // Calculate today's hours
        let todayMinutes = 0;
        const today = new Date().toDateString();
        
        attendance.forEach(session => {
            const sessionDate = new Date(session.checkIn).toDateString();
            if (sessionDate === today && session.checkOut) {
                const duration = (new Date(session.checkOut) - new Date(session.checkIn)) / (1000 * 60);
                todayMinutes += duration;
            }
        });

        if (currentSession && currentSession.checkIn) {
            const duration = (new Date() - new Date(currentSession.checkIn)) / (1000 * 60);
            todayMinutes += duration;
        }

        // Calculate week attendance
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weekSessions = attendance.filter(session => 
            new Date(session.checkIn) > oneWeekAgo
        );
        const weekAttendance = Math.round((weekSessions.length / 7) * 100);

        // Calculate average time
        const totalMinutes = attendance.reduce((acc, session) => {
            if (session.checkOut) {
                return acc + (new Date(session.checkOut) - new Date(session.checkIn)) / (1000 * 60);
            }
            return acc;
        }, 0);
        const averageMinutes = attendance.length ? Math.round(totalMinutes / attendance.length) : 0;

        return {
            todayHours: this.formatDuration(Math.round(todayMinutes)),
            weekAttendance: `${weekAttendance}%`,
            averageTime: this.formatDuration(averageMinutes)
        };
    }

    startTimeUpdater() {
        const updateTime = () => {
            const now = new Date();
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');

            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }

            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    updateUI() {
        const stats = this.calculateStats();
        const currentSession = JSON.parse(this.storage.getItem('currentSession'));

        // Update stats
        const elements = {
            todayHours: document.getElementById('todayHours'),
            weekAttendance: document.getElementById('weekAttendance'),
            avgTime: document.getElementById('avgTime')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                element.textContent = stats[key === 'avgTime' ? 'averageTime' : key];
            }
        });

        // Toggle buttons
        this.toggleButtons(!!currentSession?.checkIn);
    }
}

// Initialize attendance manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.attendanceManager = new AttendanceManager();
});

// Office location coordinates (replace with your office coordinates)
const OFFICE_LOCATION = {
    latitude: 25.605686,
    longitude: 85.169482,
    radius: 100
};

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// Function to validate attendance timing
function validateAttendanceTiming() {
    const lastRecord = attendanceManager.getLastRecord();
    const now = new Date();
    
    if (!lastRecord) return true;
    
    const lastTime = new Date(lastRecord.timestamp);
    const timeDiff = (now - lastTime) / (1000 * 60); // difference in minutes
    
    if (lastRecord.type === 'check-in' && timeDiff < 1) {
        showNotification('Please wait at least 1 minute between check-in and check-out', 'warning');
        return false;
    }
    
    return true;
}

// Function to check if user is within office radius
async function checkLocationAndMarkAttendance() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser', 'error');
        return;
    }

    if (!validateAttendanceTiming()) return;

    const checkInButton = document.getElementById('checkInButton');
    checkInButton.disabled = true;
    checkInButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking location...';

    try {
        const position = await getCurrentPosition();
        const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude
        );

        if (distance <= OFFICE_LOCATION.radius) {
            showLocationConfirmation(position.coords);
        } else {
            showOutOfRangeError(distance);
        }
    } catch (error) {
        handleLocationError(error);
    } finally {
        checkInButton.disabled = false;
        checkInButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Check In';
    }
}

// Promise-based geolocation
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    });
}

// Function to show location confirmation
function showLocationConfirmation(coords) {
    const lastRecord = attendanceManager.getLastRecord();
    const actionType = lastRecord?.type === 'check-in' ? 'check-out' : 'check-in';
    
    const modal = document.createElement('div');
    modal.className = 'location-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Confirm ${actionType === 'check-in' ? 'Check-In' : 'Check-Out'}</h3>
            <div class="location-map" id="locationMap"></div>
            <p>You are within the office premises.</p>
            <p class="location-details">
                Distance from office: ${calculateDistance(
                    coords.latitude,
                    coords.longitude,
                    OFFICE_LOCATION.latitude,
                    OFFICE_LOCATION.longitude
                ).toFixed(2)} meters
            </p>
            ${actionType === 'check-out' ? `
                <div class="work-hours">
                    <h4>Today's Work Hours</h4>
                    <p>${formatWorkHours(attendanceManager.calculateWorkHours())}</p>
                </div>
            ` : ''}
            <div class="modal-buttons">
                <button class="confirm-btn" onclick="confirmAttendance('${actionType}', ${coords.latitude}, ${coords.longitude})">
                    <i class="fas fa-check"></i> Confirm ${actionType === 'check-in' ? 'Check-In' : 'Check-Out'}
                </button>
                <button class="cancel-btn" onclick="closeLocationModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    initializeMap(coords);
}

// Function to confirm attendance
function confirmAttendance(type, lat, lon) {
    const location = { latitude: lat, longitude: lon };
    const record = attendanceManager.addRecord(type, location);
    
    closeLocationModal();
    showNotification(
        `Successfully marked ${type === 'check-in' ? 'Check-In' : 'Check-Out'}`,
        'success'
    );
    
    updateAttendanceDisplay();
}

// Function to format work hours
function formatWorkHours({ hours, minutes }) {
    return `${hours}h ${minutes}m`;
}

// Function to update attendance display
function updateAttendanceDisplay() {
    const todayRecords = attendanceManager.getTodayRecords();
    const workHours = attendanceManager.calculateWorkHours();
    
    const statusElement = document.getElementById('attendanceStatus');
    if (statusElement) {
        statusElement.innerHTML = `
            <div class="attendance-summary">
                <h4>Today's Attendance</h4>
                <p>Status: ${getAttendanceStatus(todayRecords)}</p>
                <p>Work Hours: ${formatWorkHours(workHours)}</p>
            </div>
        `;
    }
}

// Function to get attendance status
function getAttendanceStatus(records) {
    const lastRecord = records[records.length - 1];
    if (!lastRecord) return 'Not Checked In';
    return lastRecord.type === 'check-in' ? 'Checked In' : 'Checked Out';
}

// Function to show location confirmation
function showLocationConfirmation(coords) {
    const modal = document.createElement('div');
    modal.className = 'location-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Confirm Check-In</h3>
            <div class="location-map" id="locationMap"></div>
            <p>You are within the office premises.</p>
            <p class="location-details">
                Distance from office: ${calculateDistance(
                    coords.latitude,
                    coords.longitude,
                    OFFICE_LOCATION.latitude,
                    OFFICE_LOCATION.longitude
                ).toFixed(2)} meters
            </p>
            <div class="modal-buttons">
                <button class="confirm-btn" onclick="confirmCheckIn()">
                    <i class="fas fa-check"></i> Confirm Check-In
                </button>
                <button class="cancel-btn" onclick="closeLocationModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Initialize map (using Leaflet.js)
    initializeMap(coords);
}

// Function to initialize map
function initializeMap(coords) {
    // Add this in your HTML head:
    // <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    // <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

    const map = L.map('locationMap').setView([coords.latitude, coords.longitude], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors'
    }).addTo(map);

    // Add office marker
    L.circle([OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude], {
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.2,
        radius: OFFICE_LOCATION.radius
    }).addTo(map);

    // Add user location marker
    L.marker([coords.latitude, coords.longitude]).addTo(map)
        .bindPopup('You are here')
        .openPopup();
}

// Function to show out of range error
function showOutOfRangeError(distance) {
    showNotification(
        'Location Error',
        `You are ${distance.toFixed(0)} meters away from office. Please check in from within ${OFFICE_LOCATION.radius} meters of the office.`,
        'error'
    );
}

// Function to handle location errors
function handleLocationError(error) {
    let message;
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = "Please allow location access to check in.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        default:
            message = "An unknown error occurred.";
            break;
    }
    showNotification('Location Error', message, 'error');
}