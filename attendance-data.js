// Attendance data management
class AttendanceManager {
    constructor() {
        this.storageKey = 'attendance_records';
        this.records = this.loadRecords();
    }

    loadRecords() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    saveRecords() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.records));
    }

    addRecord(type, location) {
        const record = {
            id: Date.now(),
            type: type, // 'check-in' or 'check-out'
            timestamp: new Date().toISOString(),
            location: location,
            verified: true
        };
        this.records.push(record);
        this.saveRecords();
        return record;
    }

    getLastRecord() {
        return this.records[this.records.length - 1] || null;
    }

    getTodayRecords() {
        const today = new Date().toISOString().split('T')[0];
        return this.records.filter(record => 
            record.timestamp.startsWith(today)
        );
    }

    calculateWorkHours() {
        const todayRecords = this.getTodayRecords();
        let totalMinutes = 0;
        
        for (let i = 0; i < todayRecords.length - 1; i += 2) {
            const checkIn = new Date(todayRecords[i].timestamp);
            const checkOut = new Date(todayRecords[i + 1]?.timestamp);
            
            if (todayRecords[i].type === 'check-in' && todayRecords[i + 1]?.type === 'check-out') {
                totalMinutes += (checkOut - checkIn) / (1000 * 60);
            }
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        return { hours, minutes };
    }

    getWeeklyReport() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        return this.records.filter(record => 
            new Date(record.timestamp) >= oneWeekAgo
        ).reduce((acc, record) => {
            const date = record.timestamp.split('T')[0];
            if (!acc[date]) {
                acc[date] = {
                    checkIns: 0,
                    checkOuts: 0,
                    totalHours: 0
                };
            }
            
            if (record.type === 'check-in') acc[date].checkIns++;
            if (record.type === 'check-out') acc[date].checkOuts++;
            
            return acc;
        }, {});
    }
}

class AttendanceData {
    constructor() {
        this.storage = window.localStorage;
        this.initializeData();
    }

    initializeData() {
        const defaultData = {
            user: {
                id: '1',
                name: 'John Doe',
                role: 'Employee',
                email: 'john.doe@company.com',
                avatar: 'https://via.placeholder.com/40'
            },
            settings: {
                notifications: true,
                locationServices: true,
                theme: 'light'
            },
            workHours: {
                start: '09:00',
                end: '17:00',
                breakDuration: 60 // minutes
            }
        };

        // Initialize default data if not exists
        if (!this.storage.getItem('userData')) {
            this.storage.setItem('userData', JSON.stringify(defaultData));
        }
    }

    getUserData() {
        return JSON.parse(this.storage.getItem('userData'));
    }

    updateUserData(data) {
        const currentData = this.getUserData();
        const updatedData = { ...currentData, ...data };
        this.storage.setItem('userData', JSON.stringify(updatedData));
    }

    getAttendanceHistory() {
        return JSON.parse(this.storage.getItem('attendance')) || [];
    }

    getMonthlyStats(month, year) {
        const attendance = this.getAttendanceHistory();
        const monthAttendance = attendance.filter(session => {
            const date = new Date(session.checkIn);
            return date.getMonth() === month && date.getFullYear() === year;
        });

        const totalDays = new Date(year, month + 1, 0).getDate();
        const attendedDays = new Set(monthAttendance.map(session => 
            new Date(session.checkIn).getDate()
        )).size;

        const totalHours = monthAttendance.reduce((acc, session) => {
            if (session.checkOut) {
                const duration = (new Date(session.checkOut) - new Date(session.checkIn)) / (1000 * 60 * 60);
                return acc + duration;
            }
            return acc;
        }, 0);

        return {
            attendedDays,
            totalDays,
            attendanceRate: Math.round((attendedDays / totalDays) * 100),
            averageHours: totalHours / attendedDays || 0,
            totalHours
        };
    }

    getWeeklyStats() {
        const attendance = this.getAttendanceHistory();
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);

        const weekAttendance = attendance.filter(session => 
            new Date(session.checkIn) >= startOfWeek
        );

        const dailyHours = Array(7).fill(0);
        weekAttendance.forEach(session => {
            if (session.checkOut) {
                const day = new Date(session.checkIn).getDay();
                const hours = (new Date(session.checkOut) - new Date(session.checkIn)) / (1000 * 60 * 60);
                dailyHours[day] += hours;
            }
        });

        return {
            dailyHours,
            totalHours: dailyHours.reduce((a, b) => a + b, 0),
            daysPresent: dailyHours.filter(hours => hours > 0).length
        };
    }

    isWithinWorkHours() {
        const { workHours } = this.getUserData();
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMinute] = workHours.start.split(':').map(Number);
        const [endHour, endMinute] = workHours.end.split(':').map(Number);
        
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        return currentTime >= startTime && currentTime <= endTime;
    }

    calculateOvertime() {
        const { workHours } = this.getUserData();
        const [endHour, endMinute] = workHours.end.split(':').map(Number);
        const standardMinutes = (endHour * 60 + endMinute) - 
                              (workHours.start.split(':').map(Number)[0] * 60 + 
                               workHours.start.split(':').map(Number)[1]);

        const currentSession = JSON.parse(this.storage.getItem('currentSession'));
        if (!currentSession?.checkIn) return 0;

        const now = new Date();
        const checkIn = new Date(currentSession.checkIn);
        const minutesWorked = (now - checkIn) / (1000 * 60);

        return Math.max(0, minutesWorked - standardMinutes - workHours.breakDuration);
    }
}

// Export the AttendanceManager instance
const attendanceManager = new AttendanceManager();
const attendanceData = new AttendanceData();

export { attendanceManager, attendanceData };
