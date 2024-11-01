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