class ProfileManager {
    constructor() {
        this.initializeProfile();
        this.initializeCharts();
        this.bindEvents();
    }

    initializeProfile() {
        // Load profile data (simulated)
        this.profileData = {
            name: 'John Doe',
            title: 'Senior Software Engineer',
            department: 'Engineering Department',
            email: 'john.doe@company.com',
            phone: '+1 (555) 123-4567',
            dob: 'January 15, 1990',
            location: 'San Francisco, CA',
            skills: [
                'JavaScript', 'React', 'Node.js', 'Python',
                'AWS', 'Docker', 'Git', 'Agile',
                'Team Leadership', 'Problem Solving'
            ],
            schedule: [
                { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
                { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
                { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
                { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
                { day: 'Friday', hours: '9:00 AM - 5:00 PM' }
            ],
            activities: [
                {
                    type: 'attendance',
                    description: 'Checked in for the day',
                    time: '9:00 AM',
                    date: '2024-01-07'
                },
                {
                    type: 'project',
                    description: 'Completed Sprint Planning',
                    time: '10:30 AM',
                    date: '2024-01-07'
                },
                {
                    type: 'meeting',
                    description: 'Team Sync Meeting',
                    time: '2:00 PM',
                    date: '2024-01-07'
                },
                {
                    type: 'achievement',
                    description: 'Completed Project Milestone',
                    time: '4:30 PM',
                    date: '2024-01-06'
                }
            ],
            projects: [
                {
                    name: 'Employee Portal Redesign',
                    progress: 75,
                    deadline: '2024-02-15',
                    status: 'in-progress'
                },
                {
                    name: 'API Integration',
                    progress: 90,
                    deadline: '2024-01-20',
                    status: 'review'
                },
                {
                    name: 'Mobile App Development',
                    progress: 30,
                    deadline: '2024-03-01',
                    status: 'in-progress'
                }
            ]
        };

        this.updateUI();
    }

    updateUI() {
        // Update profile information
        document.getElementById('profile-name').textContent = this.profileData.name;
        document.getElementById('profile-title').textContent = this.profileData.title;
        document.getElementById('profile-department').textContent = this.profileData.department;
        document.getElementById('profile-email').textContent = this.profileData.email;
        document.getElementById('profile-phone').textContent = this.profileData.phone;
        document.getElementById('profile-dob').textContent = this.profileData.dob;
        document.getElementById('profile-location').textContent = this.profileData.location;

        // Update skills
        this.updateSkills();

        // Update schedule
        this.updateSchedule();

        // Update activity timeline
        this.updateActivityTimeline();

        // Update projects
        this.updateProjects();
    }

    updateSkills() {
        const container = document.getElementById('skills-container');
        container.innerHTML = this.profileData.skills.map(skill => `
            <div class="badge badge-primary badge-lg">${skill}</div>
        `).join('');

        const editContainer = document.getElementById('edit-skills-container');
        if (editContainer) {
            editContainer.innerHTML = this.profileData.skills.map(skill => `
                <div class="badge badge-primary badge-lg gap-2">
                    ${skill}
                    <button onclick="profileManager.removeSkill('${skill}')" class="btn btn-ghost btn-xs">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    updateSchedule() {
        const container = document.getElementById('schedule-container');
        container.innerHTML = this.profileData.schedule.map(schedule => `
            <div class="flex justify-between items-center">
                <span class="font-medium">${schedule.day}</span>
                <span class="text-sm opacity-75">${schedule.hours}</span>
            </div>
        `).join('');
    }

    updateActivityTimeline() {
        const container = document.getElementById('activity-timeline');
        container.innerHTML = this.profileData.activities.map(activity => `
            <div class="flex items-start gap-4">
                <div class="flex-none">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="flex-1">
                    <p class="font-medium">${activity.description}</p>
                    <p class="text-sm opacity-70">${activity.time} - ${activity.date}</p>
                </div>
            </div>
        `).join('');
    }

    updateProjects() {
        const container = document.getElementById('projects-container');
        container.innerHTML = this.profileData.projects.map(project => `
            <div class="card bg-base-200">
                <div class="card-body">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="card-title">${project.name}</h4>
                            <p class="text-sm opacity-75">Deadline: ${project.deadline}</p>
                        </div>
                        <div class="badge badge-${this.getStatusBadge(project.status)}">
                            ${this.formatStatus(project.status)}
                        </div>
                    </div>
                    <progress class="progress progress-primary w-full" value="${project.progress}" max="100"></progress>
                    <div class="text-sm text-right">${project.progress}%</div>
                </div>
            </div>
        `).join('');
    }

    initializeCharts() {
        const ctx = document.getElementById('performance-chart').getContext('2d');
        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Performance Score',
                    data: [85, 88, 92, 90, 95, 93],
                    fill: true,
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    borderColor: 'rgb(147, 51, 234)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    bindEvents() {
        // Profile image upload
        const profileUpload = document.getElementById('profile-upload');
        if (profileUpload) {
            profileUpload.addEventListener('change', (e) => this.handleProfileImageUpload(e));
        }

        // Skill input
        const skillInput = document.getElementById('skill-input');
        if (skillInput) {
            skillInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addSkill();
                }
            });
        }
    }

    handleProfileImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('main-profile-image').src = e.target.result;
                document.getElementById('nav-profile-image').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    editSkills() {
        document.getElementById('edit-skills-modal').showModal();
    }

    addSkill() {
        const input = document.getElementById('skill-input');
        const skill = input.value.trim();
        
        if (skill && !this.profileData.skills.includes(skill)) {
            this.profileData.skills.push(skill);
            this.updateSkills();
            input.value = '';
        }
    }

    removeSkill(skill) {
        this.profileData.skills = this.profileData.skills.filter(s => s !== skill);
        this.updateSkills();
    }

    getActivityIcon(type) {
        const icons = {
            'attendance': '<div class="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center"><i class="fas fa-clock text-success"></i></div>',
            'project': '<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><i class="fas fa-project-diagram text-primary"></i></div>',
            'meeting': '<div class="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center"><i class="fas fa-users text-info"></i></div>',
            'achievement': '<div class="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center"><i class="fas fa-trophy text-warning"></i></div>'
        };
        return icons[type] || '';
    }

    getStatusBadge(status) {
        const badges = {
            'in-progress': 'primary',
            'review': 'warning',
            'completed': 'success',
            'on-hold': 'error'
        };
        return badges[status] || 'ghost';
    }

    formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}

// Initialize profile manager
const profileManager = new ProfileManager();
export default profileManager;

document.addEventListener('DOMContentLoaded', function() {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const profileContainer = document.querySelector('.profile-container');
    let isEditMode = false;

    // Store original values for cancellation
    let originalValues = {};

    // Initialize editable fields with their specific types
    const editableFields = {
        'fullName': { type: 'text', label: 'Full Name', validation: /^[A-Za-z\s]{2,50}$/ },
        'designation': { type: 'text', label: 'Designation' },
        'department': { type: 'text', label: 'Department' },
        'phone': { type: 'tel', label: 'Phone', validation: /^\+?[\d\s-]{10,}$/ },
        'email': { type: 'email', label: 'Email', validation: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ },
        'dob': { type: 'date', label: 'Date of Birth' },
        'location': { type: 'text', label: 'Location' }
    };

    function makeFieldEditable(field, config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editable-field';
        wrapper.dataset.fieldName = field;

        const valueElement = document.querySelector(`[data-field="${field}"]`);
        if (!valueElement) return;

        // Store original value
        originalValues[field] = valueElement.textContent;

        // Create input element based on field type
        const input = document.createElement('input');
        input.type = config.type;
        input.className = 'edit-input';
        input.value = valueElement.textContent;
        input.placeholder = `Enter ${config.label}`;
        input.style.display = 'none';

        // Add validation message element
        const validationMsg = document.createElement('div');
        validationMsg.className = 'validation-message';
        
        wrapper.appendChild(valueElement);
        wrapper.appendChild(input);
        wrapper.appendChild(validationMsg);

        // Add edit controls
        const controls = createEditControls();
        wrapper.appendChild(controls);

        return wrapper;
    }

    function createEditControls() {
        const controls = document.createElement('div');
        controls.className = 'edit-controls';
        controls.innerHTML = `
            <button class="save-btn" title="Save changes">
                <i class="fas fa-check"></i>
            </button>
            <button class="cancel-btn" title="Cancel editing">
                <i class="fas fa-times"></i>
            </button>
        `;
        return controls;
    }

    function startEditing(wrapper) {
        const fieldName = wrapper.dataset.fieldName;
        const valueElement = wrapper.querySelector('[data-field]');
        const input = wrapper.querySelector('.edit-input');
        const config = editableFields[fieldName];

        valueElement.style.display = 'none';
        input.style.display = 'block';
        input.value = valueElement.textContent;
        wrapper.classList.add('editing');
        input.focus();

        // Add specific validation for the field type
        input.addEventListener('input', () => validateField(input, config, wrapper));
    }

    function validateField(input, config, wrapper) {
        const validationMsg = wrapper.querySelector('.validation-message');
        if (config.validation && !config.validation.test(input.value)) {
            validationMsg.textContent = `Please enter a valid ${config.label.toLowerCase()}`;
            input.classList.add('invalid');
            return false;
        }
        validationMsg.textContent = '';
        input.classList.remove('invalid');
        return true;
    }

    async function saveChanges(wrapper) {
        const fieldName = wrapper.dataset.fieldName;
        const input = wrapper.querySelector('.edit-input');
        const valueElement = wrapper.querySelector('[data-field]');
        const config = editableFields[fieldName];

        if (!validateField(input, config, wrapper)) {
            showNotification('Error', 'Please correct the validation errors', 'error');
            return;
        }

        try {
            // Simulate API call - replace with your actual API endpoint
            const response = await updateFieldValue(fieldName, input.value);
            
            if (response.success) {
                valueElement.textContent = input.value;
                showNotification('Success', `${config.label} updated successfully!`, 'success');
                finishEditing(wrapper);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            showNotification('Error', error.message || 'Failed to update field', 'error');
        }
    }

    // Simulate API call - replace with actual API implementation
    async function updateFieldValue(field, value) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate successful response
        return {
            success: true,
            message: 'Update successful'
        };
    }

    function cancelEditing(wrapper) {
        const fieldName = wrapper.dataset.fieldName;
        const valueElement = wrapper.querySelector('[data-field]');
        valueElement.textContent = originalValues[fieldName];
        finishEditing(wrapper);
    }

    function finishEditing(wrapper) {
        const valueElement = wrapper.querySelector('[data-field]');
        const input = wrapper.querySelector('.edit-input');
        const validationMsg = wrapper.querySelector('.validation-message');

        valueElement.style.display = 'block';
        input.style.display = 'none';
        validationMsg.textContent = '';
        wrapper.classList.remove('editing');
    }

    // Initialize all editable fields
    Object.entries(editableFields).forEach(([field, config]) => {
        const element = document.querySelector(`[data-field="${field}"]`);
        if (element) {
            const wrapper = makeFieldEditable(field, config);
            element.parentNode.replaceChild(wrapper, element);
        }
    });

    // Event Listeners
    editProfileBtn.addEventListener('click', () => {
        isEditMode = !isEditMode;
        profileContainer.classList.toggle('edit-mode', isEditMode);
        editProfileBtn.innerHTML = isEditMode ? 
            '<i class="fas fa-times"></i> Cancel Editing' : 
            '<i class="fas fa-edit"></i> Edit Profile';
    });

    // Delegate events for edit controls
    profileContainer.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.editable-field');
        if (!wrapper) return;

        if (e.target.closest('.save-btn')) {
            saveChanges(wrapper);
        } else if (e.target.closest('.cancel-btn')) {
            cancelEditing(wrapper);
        } else if (isEditMode && !wrapper.classList.contains('editing')) {
            startEditing(wrapper);
        }
    });
});