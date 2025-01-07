// Motivational quotes for office productivity
const quotes = [
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
    },
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    },
    {
        text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
        author: "Steve Jobs"
    },
    {
        text: "Success usually comes to those who are too busy to be looking for it.",
        author: "Henry David Thoreau"
    },
    {
        text: "The future depends on what you do today.",
        author: "Mahatma Gandhi"
    },
    {
        text: "Don't count the days, make the days count.",
        author: "Muhammad Ali"
    },
    {
        text: "The only place where success comes before work is in the dictionary.",
        author: "Vidal Sassoon"
    },
    {
        text: "Either you run the day or the day runs you.",
        author: "Jim Rohn"
    },
    {
        text: "The difference between ordinary and extraordinary is that little extra.",
        author: "Jimmy Johnson"
    },
    {
        text: "The best way to predict the future is to create it.",
        author: "Peter Drucker"
    }
];

class DashboardManager {
    constructor() {
        this.initializeCharts();
        this.displayRandomQuote();
        this.updateDashboard();
        this.startPeriodicUpdates();
        this.bindEvents();
    }

    displayRandomQuote() {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById('quote-text').textContent = randomQuote.text;
        document.getElementById('quote-author').textContent = `- ${randomQuote.author}`;

        // Change quote every 1 hour
        setInterval(() => this.displayRandomQuote(), 3600000);
    }

    initializeCharts() {
        // Weekly Attendance Chart
        const weeklyCtx = document.getElementById('weekly-chart').getContext('2d');
        this.weeklyChart = new Chart(weeklyCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{
                    label: 'Hours Worked',
                    data: [7.5, 8, 6.5, 8, 7],
                    backgroundColor: 'rgba(147, 51, 234, 0.5)',
                    borderColor: 'rgb(147, 51, 234)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });

        // Monthly Hours Chart
        const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
        this.monthlyChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Average Daily Hours',
                    data: [7.8, 7.5, 8.2, 7.9],
                    fill: true,
                    backgroundColor: 'rgba(72, 187, 120, 0.2)',
                    borderColor: 'rgb(72, 187, 120)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }

    updateDashboard() {
        this.updateStats();
        this.updateRecentActivity();
        this.updateTeamOverview();
    }

    updateStats() {
        // Simulate real stats (replace with actual data in production)
        document.getElementById('today-hours').textContent = '7h 30m';
        document.getElementById('check-in-time').textContent = 'Checked in at 9:00 AM';
        document.getElementById('attendance-rate').textContent = '95%';
        document.getElementById('avg-hours').textContent = '7h 45m';
        document.getElementById('performance-score').textContent = '92';
    }

    updateRecentActivity() {
        const activities = [
            {
                type: 'check-in',
                time: '9:00 AM',
                description: 'Checked in for the day'
            },
            {
                type: 'meeting',
                time: '10:30 AM',
                description: 'Team standup meeting'
            },
            {
                type: 'break',
                time: '1:00 PM',
                description: 'Lunch break'
            },
            {
                type: 'task',
                time: '2:30 PM',
                description: 'Completed project milestone'
            }
        ];

        const activityContainer = document.getElementById('recent-activity');
        activityContainer.innerHTML = activities.map(activity => `
            <div class="flex items-center space-x-4">
                <div class="flex-none">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="flex-1">
                    <p class="font-medium">${activity.description}</p>
                    <p class="text-sm opacity-70">${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    updateTeamOverview() {
        const teamMembers = [
            {
                name: 'John Doe',
                status: 'online',
                checkIn: '9:00 AM',
                hours: '7h 30m'
            },
            {
                name: 'Jane Smith',
                status: 'online',
                checkIn: '8:45 AM',
                hours: '7h 45m'
            },
            {
                name: 'Mike Johnson',
                status: 'away',
                checkIn: '9:15 AM',
                hours: '7h 15m'
            },
            {
                name: 'Sarah Wilson',
                status: 'offline',
                checkIn: '-',
                hours: '-'
            }
        ];

        const teamTable = document.getElementById('team-overview');
        teamTable.innerHTML = teamMembers.map(member => `
            <tr>
                <td class="font-medium">${member.name}</td>
                <td>
                    <div class="badge badge-${this.getStatusBadge(member.status)}">
                        ${member.status}
                    </div>
                </td>
                <td>${member.checkIn}</td>
                <td>${member.hours}</td>
            </tr>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'check-in': '<div class="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center"><i class="fas fa-sign-in-alt text-success"></i></div>',
            'meeting': '<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><i class="fas fa-users text-primary"></i></div>',
            'break': '<div class="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center"><i class="fas fa-coffee text-warning"></i></div>',
            'task': '<div class="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center"><i class="fas fa-tasks text-info"></i></div>'
        };
        return icons[type] || '';
    }

    getStatusBadge(status) {
        const badges = {
            'online': 'success',
            'away': 'warning',
            'offline': 'ghost'
        };
        return badges[status] || 'ghost';
    }

    startPeriodicUpdates() {
        // Update dashboard every 5 minutes
        setInterval(() => this.updateDashboard(), 300000);
    }

    bindEvents() {
        // Time period selector for charts
        const periodSelector = document.getElementById('time-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', () => this.updateCharts());
        }

        // Theme change listener
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                const isDark = themeToggle.checked;
                document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
                this.updateChartsTheme(isDark);
            });
        }
    }

    updateCharts() {
        const weeklyStats = attendanceData.getWeeklyStats();
        if (this.weeklyChart) {
            this.weeklyChart.data.datasets[0].data = weeklyStats.dailyHours;
            this.weeklyChart.update();
        }

        const now = new Date();
        const monthlyStats = attendanceData.getMonthlyStats(now.getMonth(), now.getFullYear());
        if (this.monthlyChart) {
            const days = Array.from({ length: monthlyStats.totalDays }, (_, i) => i + 1);
            this.monthlyChart.data.labels = days;
            this.monthlyChart.data.datasets[0].data = days.map(() => 
                monthlyStats.averageHours
            );
            this.monthlyChart.update();
        }
    }

    updateChartsTheme(isDark) {
        const chartOptions = {
            scales: {
                y: {
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDark ? '#fff' : '#666'
                    }
                },
                x: {
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDark ? '#fff' : '#666'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: isDark ? '#fff' : '#666'
                    }
                }
            }
        };

        if (this.weeklyChart) {
            this.weeklyChart.options = { ...this.weeklyChart.options, ...chartOptions };
            this.weeklyChart.update();
        }

        if (this.monthlyChart) {
            this.monthlyChart.options = { ...this.monthlyChart.options, ...chartOptions };
            this.monthlyChart.update();
        }
    }
}

// Initialize dashboard
const dashboardManager = new DashboardManager();
export default dashboardManager;
