// Sample colleagues data
const colleaguesData = [
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@company.com",
        phone: "+1 (555) 123-4567",
        position: "Senior Developer",
        department: "Engineering",
        location: "New York",
        avatar: "https://via.placeholder.com/150",
        status: "active",
        joinDate: "2023-01-15",
        attendance: {
            present: true,
            checkInTime: "09:00 AM",
            totalHours: "8h 30m"
        }
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@company.com",
        phone: "+1 (555) 234-5678",
        position: "UI/UX Designer",
        department: "Design",
        location: "San Francisco",
        avatar: "https://via.placeholder.com/150",
        status: "active",
        joinDate: "2023-02-01",
        attendance: {
            present: true,
            checkInTime: "08:45 AM",
            totalHours: "8h 15m"
        }
    },
    // Add more sample data as needed
];

class ColleaguesManager {
    constructor() {
        this.colleagues = this.loadColleagues();
        this.initializeNotifications();
    }

    loadColleagues() {
        const stored = localStorage.getItem('colleagues');
        if (!stored) {
            localStorage.setItem('colleagues', JSON.stringify(colleaguesData));
            return colleaguesData;
        }
        return JSON.parse(stored);
    }

    getAllColleagues() {
        return this.colleagues;
    }

    getColleagueById(id) {
        return this.colleagues.find(colleague => colleague.id === id);
    }

    searchColleagues(query) {
        query = query.toLowerCase();
        return this.colleagues.filter(colleague => 
            colleague.name.toLowerCase().includes(query) ||
            colleague.email.toLowerCase().includes(query) ||
            colleague.department.toLowerCase().includes(query) ||
            colleague.location.toLowerCase().includes(query)
        );
    }

    filterColleagues(filters) {
        return this.colleagues.filter(colleague => {
            let matches = true;
            if (filters.department) {
                matches = matches && colleague.department === filters.department;
            }
            if (filters.location) {
                matches = matches && colleague.location === filters.location;
            }
            if (filters.status) {
                matches = matches && colleague.status === filters.status;
            }
            return matches;
        });
    }

    updateColleagueStatus(id, status) {
        const colleague = this.getColleagueById(id);
        if (colleague) {
            colleague.status = status;
            this.saveColleagues();
            this.notifyStatusChange(colleague);
        }
    }

    updateColleagueAttendance(id, attendanceData) {
        const colleague = this.getColleagueById(id);
        if (colleague) {
            colleague.attendance = { ...colleague.attendance, ...attendanceData };
            this.saveColleagues();
            this.notifyAttendanceUpdate(colleague);
        }
    }

    saveColleagues() {
        localStorage.setItem('colleagues', JSON.stringify(this.colleagues));
    }

    // Notification System
    initializeNotifications() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    notifyStatusChange(colleague) {
        this.createNotification(
            'Colleague Status Update',
            `${colleague.name}'s status changed to ${colleague.status}`
        );
    }

    notifyAttendanceUpdate(colleague) {
        this.createNotification(
            'Attendance Update',
            `${colleague.name} ${colleague.attendance.present ? 'checked in' : 'checked out'} at ${colleague.attendance.checkInTime}`
        );
    }

    createNotification(title, message) {
        // Add to notification center
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.unshift({
            id: Date.now(),
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));

        // Update notification badge
        this.updateNotificationBadge();

        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
            new Notification(title, { body: message });
        }
    }

    updateNotificationBadge() {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const unreadCount = notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    getNotifications() {
        return JSON.parse(localStorage.getItem('notifications') || '[]');
    }

    markNotificationAsRead(id) {
        const notifications = this.getNotifications();
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            localStorage.setItem('notifications', JSON.stringify(notifications));
            this.updateNotificationBadge();
        }
    }
}

// Initialize colleagues manager
const colleaguesManager = new ColleaguesManager();
export default colleaguesManager;
