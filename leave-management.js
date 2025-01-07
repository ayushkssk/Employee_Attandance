class LeaveManager {
    constructor() {
        this.leaves = this.loadLeaves();
        this.initializeUI();
        this.initializeDatePicker();
    }

    loadLeaves() {
        return JSON.parse(localStorage.getItem('leaves') || '[]');
    }

    saveLeaves() {
        localStorage.setItem('leaves', JSON.stringify(this.leaves));
    }

    initializeUI() {
        // Initialize form submission
        const form = document.getElementById('leave-request-form');
        form.addEventListener('submit', (e) => this.handleLeaveRequest(e));

        // Update UI elements
        this.updateLeaveBalance();
        this.updateLeaveTable();
        this.updateLeaveHistory();
    }

    initializeDatePicker() {
        flatpickr("#date-range", {
            mode: "range",
            minDate: "today",
            dateFormat: "Y-m-d",
            disable: [
                function(date) {
                    // Disable weekends
                    return date.getDay() === 0 || date.getDay() === 6;
                }
            ],
            onChange: (selectedDates) => {
                if (selectedDates.length === 2) {
                    const days = this.calculateWorkingDays(selectedDates[0], selectedDates[1]);
                    console.log(`Selected ${days} working days`);
                }
            }
        });
    }

    calculateWorkingDays(startDate, endDate) {
        let count = 0;
        const curDate = new Date(startDate.getTime());
        while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    }

    async handleLeaveRequest(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const dateRange = formData.get('dateRange').split(' to ');
        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1] || dateRange[0]);
        
        const leaveRequest = {
            id: Date.now(),
            type: formData.get('leaveType'),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            days: this.calculateWorkingDays(startDate, endDate),
            reason: formData.get('reason'),
            status: 'pending',
            requestedOn: new Date().toISOString(),
            userId: 'current-user-id' // Replace with actual user ID
        };

        try {
            await this.submitLeaveRequest(leaveRequest);
            this.showNotification('Leave request submitted successfully', 'success');
            document.getElementById('leave-request-modal').close();
            form.reset();
            this.updateLeaveTable();
            this.updateLeaveBalance();
        } catch (error) {
            this.showNotification('Failed to submit leave request', 'error');
        }
    }

    async submitLeaveRequest(leaveRequest) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                this.leaves.unshift(leaveRequest);
                this.saveLeaves();
                resolve(leaveRequest);
            }, 500);
        });
    }

    updateLeaveTable() {
        const table = document.getElementById('leave-requests-table');
        const recentLeaves = this.leaves.slice(0, 5); // Show only 5 recent requests

        table.innerHTML = recentLeaves.map(leave => `
            <tr>
                <td>
                    <div class="badge badge-${this.getLeaveTypeBadge(leave.type)}">
                        ${this.capitalizeFirstLetter(leave.type)}
                    </div>
                </td>
                <td>${new Date(leave.startDate).toLocaleDateString()}</td>
                <td>${new Date(leave.endDate).toLocaleDateString()}</td>
                <td>${leave.days} days</td>
                <td>
                    <div class="badge badge-${this.getStatusBadge(leave.status)}">
                        ${this.capitalizeFirstLetter(leave.status)}
                    </div>
                </td>
                <td>
                    ${leave.status === 'pending' ? `
                        <button class="btn btn-ghost btn-xs" onclick="leaveManager.cancelLeave(${leave.id})">
                            Cancel
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    updateLeaveHistory() {
        const table = document.getElementById('leave-history-table');
        
        table.innerHTML = this.leaves.map(leave => `
            <tr>
                <td>
                    <div class="badge badge-${this.getLeaveTypeBadge(leave.type)}">
                        ${this.capitalizeFirstLetter(leave.type)}
                    </div>
                </td>
                <td>${new Date(leave.startDate).toLocaleDateString()}</td>
                <td>${new Date(leave.endDate).toLocaleDateString()}</td>
                <td>${leave.days} days</td>
                <td>
                    <div class="badge badge-${this.getStatusBadge(leave.status)}">
                        ${this.capitalizeFirstLetter(leave.status)}
                    </div>
                </td>
                <td>${leave.approvedBy || '-'}</td>
                <td>${leave.approvedOn ? new Date(leave.approvedOn).toLocaleDateString() : '-'}</td>
            </tr>
        `).join('');
    }

    updateLeaveBalance() {
        // Update leave balance displays
        const annualBalance = this.calculateLeaveBalance('annual');
        const sickBalance = this.calculateLeaveBalance('sick');
        const pendingRequests = this.leaves.filter(leave => leave.status === 'pending').length;

        document.getElementById('annual-leave-balance').textContent = annualBalance;
        document.getElementById('sick-leave-balance').textContent = sickBalance;
        document.getElementById('pending-requests').textContent = pendingRequests;
    }

    calculateLeaveBalance(type) {
        const totalAllowed = type === 'annual' ? 20 : 10; // Example: 20 annual days, 10 sick days
        const used = this.leaves
            .filter(leave => leave.type === type && leave.status === 'approved')
            .reduce((total, leave) => total + leave.days, 0);
        return totalAllowed - used;
    }

    async cancelLeave(leaveId) {
        try {
            const leave = this.leaves.find(l => l.id === leaveId);
            if (leave && leave.status === 'pending') {
                leave.status = 'cancelled';
                this.saveLeaves();
                this.updateLeaveTable();
                this.updateLeaveHistory();
                this.updateLeaveBalance();
                this.showNotification('Leave request cancelled successfully', 'success');
            }
        } catch (error) {
            this.showNotification('Failed to cancel leave request', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} fixed top-4 right-4 w-auto z-50`;
        alert.innerHTML = `
            <span>${message}</span>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    getLeaveTypeBadge(type) {
        const badges = {
            annual: 'primary',
            sick: 'secondary',
            unpaid: 'accent'
        };
        return badges[type] || 'ghost';
    }

    getStatusBadge(status) {
        const badges = {
            pending: 'warning',
            approved: 'success',
            rejected: 'error',
            cancelled: 'ghost'
        };
        return badges[status] || 'ghost';
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Initialize leave manager
const leaveManager = new LeaveManager();
window.leaveManager = leaveManager; // Make it accessible globally for event handlers
