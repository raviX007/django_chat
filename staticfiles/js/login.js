document.getElementById('loginForm').addEventListener('submit', function(e) {
    let isValid = true;
    const username = document.getElementById('id_username');
    const password = document.getElementById('id_password');
    
    document.querySelectorAll('.validation-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.querySelectorAll('.auth-input').forEach(input => {
        input.classList.remove('error');
    });
    
    if (username.value.trim() === '') {
        showValidationError(username, 'Username is required');
        isValid = false;
    }
    
    if (password.value === '') {
        showValidationError(password, 'Password is required');
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

document.querySelectorAll('.auth-input').forEach(input => {
    input.addEventListener('input', function() {
        const errorDiv = this.parentElement.querySelector('.validation-error');
        
        if (this.value.trim() !== '') {
            this.classList.remove('error');
            errorDiv.style.display = 'none';
        }
    });
});