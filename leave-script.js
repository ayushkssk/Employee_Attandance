// Initialize leave data
let leaveData = {
    available: 12,
    taken: 3,
    pending: 1,
    history: [
        {
            id: 1,
            type: 'Sick Leave',
            startDate: '2024-03-01',
            endDate: '2024-03-02',
            reason: 'Fever',
            status: 'Approved'
        }
    ]
};

// Submit leave request
function submitLeave(event) {
    event.preventDefault();
    
    const leaveRequest = {
        id: leaveData.history.length + 1,
        type: document.getElementById('leaveType').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        reason: document.getElementById('reason').value,
        status: 'Pending'
    };

    // Add to history
    leaveData.history.unshift(leaveRequest);
    leaveData.pending++;
    
    // Update UI
    updateStats();
    updateHistory();
    
    // Show confirmation
    alert('Leave request submitted successfully! Waiting for approval.');
    
    // Reset form
    event.target.reset();
}

// Update statistics
function updateStats() {
    document.getElementById('availableLeaves').textContent = leaveData.available;
    document.getElementById('takenLeaves').textContent = leaveData.taken;
    document.getElementById('pendingLeaves').textContent = leaveData.pending;
}

// Update leave history
function updateHistory() {
    const historyContainer = document.getElementById('leaveHistory');
    historyContainer.innerHTML = '';

    leaveData.history.forEach(leave => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div>
                <h4>${leave.type}</h4>
                <p>${leave.startDate} to ${leave.endDate}</p>
                <p>${leave.reason}</p>
            </div>
            <div class="status-${leave.status.toLowerCase()}">${leave.status}</div>
        `;
        historyContainer.appendChild(historyItem);
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    updateHistory();
});