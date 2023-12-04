const disconect = document.getElementById('deco');
const username = document.getElementById('username-input');
const email = document.getElementById('email-input');
const password = document.getElementById('password-input');
const submit = document.getElementById('submit');
const socket = io();

socket.emit("getUserData", localStorage.getItem("username"));

socket.on("fill edit form", (row) => {
    username.value = localStorage.getItem('username');
    email.value = row.email;
    password.value = row.password;
    localStorage.setItem('password', row.password);
    localStorage.setItem('email', row.email);
});

socket.on("profil edited", (data) => {
    localStorage.setItem('username', data.username);
    localStorage.setItem('password', data.password);
    localStorage.setItem('email', data.email);
    username.value = localStorage.getItem('username');
    email.value = localStorage.getItem('email');
    password.value = localStorage.getItem('password');
    window.location.reload();
});

submit.addEventListener('click', function(event){
    if(localStorage.getItem("username") == username.value || localStorage.getItem("password") == password.value || localStorage.getItem("email") == email.value){
        const data = {
            old_username: localStorage.getItem("username"),
            username: username.value,
            password: password.value,
            email: email.value,
          };
        socket.emit("edit profil", data);
    }
});

disconect.addEventListener('click', function(event){
    localStorage.setItem('isLoggedIn', "false");
    localStorage.setItem('username', "Username");
    window.location.href = 'login.html';
});