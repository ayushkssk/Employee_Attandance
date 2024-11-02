// Office location coordinates (replace with your office coordinates)
const OFFICE_LOCATION = {
    latitude: 25.605686,  // Replace with your office latitude

    longitude: 85.169482, // Replace with your office longitude

    radius: 100        // Radius in meters
};

// Function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
}

// Function to check if user is within office radius
function checkLocationAndMarkAttendance() {
    if (!navigator.geolocation) {
        showNotification('Error', 'Geolocation is not supported by your browser', 'error');
        return;
    }

    // Show loading state
    const checkInButton = document.getElementById('checkInButton');
    checkInButton.disabled = true;
    checkInButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking location...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const distance = calculateDistance(
                position.coords.latitude,
                position.coords.longitude,
                OFFICE_LOCATION.latitude,
                OFFICE_LOCATION.longitude
            );

            if (distance <= OFFICE_LOCATION.radius) {
                // User is within office radius
                showLocationConfirmation(position.coords);
            } else {
                // User is outside office radius
                showOutOfRangeError(distance);
                checkInButton.disabled = false;
                checkInButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Check In';
            }
        },
        (error) => {
            handleLocationError(error);
            checkInButton.disabled = false;
            checkInButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Check In';
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
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
        attribution: '© OpenStreetMap contributors'
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

// Add these styles to your CSS 