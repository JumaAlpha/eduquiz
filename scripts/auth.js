// Initialize users or load from localStorage
let users = JSON.parse(localStorage.getItem('eduquiz_users')) || [
    {
        id: '1',
        name: 'Admin',
        email: 'admin@eduquiz.com',
        password: 'admin123',
        role: 'teacher',
        quizzes: []
    }
];

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');

// Toggle Forms
showSignupBtn.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Login
document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('eduquiz_currentUser', JSON.stringify(user));
        window.location.href = 'index.html';
    } else {
        alert('Invalid credentials');
    }
});

// Signup
document.getElementById('signup-btn').addEventListener('click', () => {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    if (users.some(u => u.email === email)) {
        alert('Email already exists');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role,
        quizzes: []
    };

    users.push(newUser);
    localStorage.setItem('eduquiz_users', JSON.stringify(users));
    localStorage.setItem('eduquiz_currentUser', JSON.stringify(newUser));
    window.location.href = 'index.html';
});