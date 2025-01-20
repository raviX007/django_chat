document.getElementById('registerForm').addEventListener('submit', function(e) {
    let isValid = true;
    const username = document.getElementById('id_username');
    const password1 = document.getElementById('id_password1');
    const password2 = document.getElementById('id_password2');
    
    // Clear previous errors
    document.querySelectorAll('.validation-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.querySelectorAll('.auth-input').forEach(input => {
        input.classList.remove('error');
    });
    
    // Username validation
    if (username.value.trim() === '') {
        showValidationError(username, 'Username is required');
        isValid = false;
    } else if (!/^[\w.@+-]+$/.test(username.value)) {
        showValidationError(username, 'Username can only contain letters, numbers, and @/./+/-/_');
        isValid = false;
    }
    
    // Password validation
    if (password1.value === '') {
        showValidationError(password1, 'Password is required');
        isValid = false;
    } else if (password1.value.length < 8) {
        showValidationError(password1, 'Password must be at least 8 characters long');
        isValid = false;
    }
    
    // Password confirmation validation
    if (password2.value === '') {
        showValidationError(password2, 'Password confirmation is required');
        isValid = false;
    } else if (password1.value !== password2.value) {
        showValidationError(password2, 'Passwords do not match');
        isValid = false;
    }
    
    if (!isValid) {
        e.preventDefault();
    }
});

function showValidationError(field, message) {
    const errorDiv = field.parentElement.querySelector('.validation-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    field.classList.add('error');
}

// Real-time validation
document.querySelectorAll('.auth-input').forEach(input => {
    input.addEventListener('input', function() {
        const errorDiv = this.parentElement.querySelector('.validation-error');
        
        if (this.value.trim() !== '') {
            this.classList.remove('error');
            errorDiv.style.display = 'none';
        }

        // Real-time password match validation
        if ((this.id === 'id_password2' || this.id === 'id_password1') && 
            document.getElementById('id_password2').value !== '') {
            const password1 = document.getElementById('id_password1');
            const password2 = document.getElementById('id_password2');
            
            if (password2.value !== password1.value) {
                showValidationError(password2, 'Passwords do not match');
            }
        }
    });
});