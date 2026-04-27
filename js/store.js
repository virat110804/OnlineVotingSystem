// js/store.js

// Initial Database Setup
const initDB = () => {
    if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
    if (!localStorage.getItem('admin')) localStorage.setItem('admin', JSON.stringify({ username: 'admin', password: 'admin123' }));
    if (!localStorage.getItem('election')) localStorage.setItem('election', JSON.stringify({ title: '', startTime: 0, endTime: 0, isActive: false }));
    if (!localStorage.getItem('parties')) localStorage.setItem('parties', JSON.stringify([]));
    if (!localStorage.getItem('votes')) localStorage.setItem('votes', JSON.stringify([]));
};

initDB();

// Getters
const getUsers = () => JSON.parse(localStorage.getItem('users'));
const getAdmin = () => JSON.parse(localStorage.getItem('admin'));
const getElection = () => JSON.parse(localStorage.getItem('election'));
const getParties = () => JSON.parse(localStorage.getItem('parties'));
const getVotes = () => JSON.parse(localStorage.getItem('votes'));

// Setters
const setUsers = (data) => localStorage.setItem('users', JSON.stringify(data));
const setElection = (data) => localStorage.setItem('election', JSON.stringify(data));
const setParties = (data) => localStorage.setItem('parties', JSON.stringify(data));
const setVotes = (data) => localStorage.setItem('votes', JSON.stringify(data));

// Session Management (Current Logged In User)
const loginUser = (voterId) => sessionStorage.setItem('currentUser', voterId);
const logoutUser = () => sessionStorage.removeItem('currentUser');
const getCurrentUser = () => sessionStorage.getItem('currentUser');

// Display an alert message in a specified container
const showAlert = (containerId, message, type = 'info') => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    // Optional: auto-clear after 3 seconds
    // setTimeout(() => { container.innerHTML = ''; }, 3000);
};
