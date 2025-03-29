const submit = document.getElementById("submit");
const socket = io();

submit.addEventListener('click', () => {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    socket.emit('login', username, password);
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
});

socket.on('redirect', (data) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', data.username);
    window.location.href = data.url;
});