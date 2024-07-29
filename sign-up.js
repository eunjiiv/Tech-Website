document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('sign-in-link').addEventListener('click', function(event) {
        event.preventDefault();
        document.getElementById('sign-up-form').style.display = 'none';
        document.getElementById('sign-in-form').style.display = 'block';
    });

    document.getElementById('sign-up-link').addEventListener('click', function(event) {
        event.preventDefault();
        document.getElementById('sign-in-form').style.display = 'none';
        document.getElementById('sign-up-form').style.display = 'block';
    });

    function validatePasswordStrength(password) {
        let strength = '';
        const strongPasswordPattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})");

        if (strongPasswordPattern.test(password)) {
            strength = 'Strong';
        } else if (password.length >= 6) {
            strength = 'Okay';
        } else {
            strength = 'Weak';
        }

        return strength;
    }

    document.getElementById('sign-up-password').addEventListener('input', function(event) {
        const password = event.target.value;
        const strength = validatePasswordStrength(password);
        document.getElementById('password-strength').textContent = `Password strength: ${strength}`;
    });

    document.getElementById('sign-up-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('sign-up-email').value;
        const password = document.getElementById('sign-up-password').value;

        const userData = {
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: password
        };

        let users = JSON.parse(localStorage.getItem('usersname')) || [];
        users.push(userData);
        localStorage.setItem('usersname', JSON.stringify(users));

        this.reset();
        alert('Account created successfully! Please sign in.');
    });

    document.getElementById('sign-in-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('sign-in-email').value;
        const password = document.getElementById('sign-in-password').value;

        const users = JSON.parse(localStorage.getItem('usersname')) || [];
        const currentUser = users.find(user => user.email === email && user.password === password);

        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('username', currentUser.username);
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password');
        }

        this.reset();
    });

    document.getElementById('logout-button').addEventListener('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('username'); 
        alert('You have been logged out.');
        window.location.href = 'login.html';
    });

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('username-display').innerText = currentUser.username;
    }
});
