const submit = document.getElementById("submit");
const socket = io();

submit.addEventListener('click', () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;

    const userData = {
        username: username,
        password: password,
        email: email
    };

    socket.emit("sign up", userData);
    socket.emit("login", username, password);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    localStorage.setItem("email", email);
    window.location.href = 'home.html';

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("email").value = "";
});