document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const login = document.getElementById('login');
    const signup = document.getElementById('signup');

    // Redirect if already logged in
    if (localStorage.getItem('loggedInUser')) {
        window.location.href = 'feed.html';
    }

    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    signup.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target.children[0].value;
        const email = e.target.children[1].value;
        const password = e.target.children[2].value;

        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.find(user => user.email === email)) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'User with this email already exists!',
            });
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        Swal.fire({
            icon: 'success',
            title: 'Account Created!',
            text: 'Please log in with your new account.',
            timer: 2000,
            showConfirmButton: false,
            willClose: () => {
                window.location.href = 'index.html';
            }
        });
    });

    login.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.children[0].value;
        const password = e.target.children[1].value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            window.location.href = 'feed.html';
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Invalid email or password.',
            });
        }
    });
});
