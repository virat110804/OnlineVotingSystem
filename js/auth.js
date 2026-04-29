// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Registration Logic ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const dob = document.getElementById('dob').value;
            const gender = document.getElementById('gender').value;
            const password = document.getElementById('password').value;
            
            if (!name || !dob || !gender || !password) {
                showAlert('alert-container', 'Please fill in all fields.', 'danger');
                return;
            }

            // Age check
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                showAlert('alert-container', 'You must be at least 18 years old to register.', 'danger');
                return;
            }

            // Generate Voter ID
            const voterId = "VOTER_" + Math.floor(Math.random() * 1000000);
            
            const newUser = {
                name,
                dob,
                gender,
                password,
                voterId,
                hasVoted: false
            };

            const users = getUsers();
            users.push(newUser);
            setUsers(users);

            // Hide form, show success
            registerForm.classList.add('hidden');
            const successContainer = document.getElementById('success-container');
            successContainer.classList.remove('hidden');
            document.getElementById('display-voter-id').textContent = voterId;
            
            showAlert('alert-container', '', 'info'); // clear alerts
        });
    }

    // --- Voter Login Logic ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const voterId = document.getElementById('voter-id').value.trim();
            const password = document.getElementById('password').value;
            
            if (!voterId || !password) {
                showAlert('alert-container', 'Please enter Voter ID and password.', 'danger');
                return;
            }

            const users = getUsers();
            const user = users.find(u => u.voterId === voterId && u.password === password);

            if (user) {
                loginUser(user.voterId);
                window.location.href = 'vote.html';
            } else {
                showAlert('alert-container', 'Invalid Voter ID or Password.', 'danger');
            }
        });
    }
});
