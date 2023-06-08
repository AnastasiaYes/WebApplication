const butRegister = document.getElementById('but_register');
const butEntrance = document.getElementById('but_entrance');

const formEnter = document.querySelector('.container_form_enter');
const formRegister = document.querySelector('.container_form_register');

butRegister.addEventListener("click", function () {
    formRegister.classList.remove('form_inactive');
    formEnter.classList.add('form_inactive');
});

butEntrance.addEventListener("click", function () {
    formRegister.classList.add('form_inactive');
    formEnter.classList.remove('form_inactive');
});

const userName = document.querySelector('#userName');
const registerEmail = document.querySelector('#register-email');
const registerPassword = document.querySelector('#register-password');
const passwordRepeat = document.querySelector('#password-repeat');
const registerSubmitBut = document.querySelector('#register-submit');

function User(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
}

formRegister.addEventListener("submit", (e) => {
    document.querySelectorAll('.container_form_register .error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.container_form_register .password_mismatch.active').forEach(el => el.classList.remove('active'));

    const user = new User(userName.value, registerEmail.value, registerPassword.value);

    const emailExpr = new RegExp(/^([a-z0-9._%+-]+)@([a-z0-9.-]+)\.([a-z]{2,})$/g);
    if (!emailExpr.test(user.email)) {
        registerEmail.classList.add('error');
        e.preventDefault();
    }

    const passwordExpr = new RegExp(/^([a-zA-Z0-9*_!@#$%^&()]+)$/);
    if (!passwordExpr.test(user.password)) {
        registerPassword.classList.add('error');
        e.preventDefault();
    }

    if (registerPassword.value !== passwordRepeat.value) {
        const passwordMismatch = document.querySelector('.password_mismatch');
        passwordMismatch.classList.add('active');
        e.preventDefault();
    }
})