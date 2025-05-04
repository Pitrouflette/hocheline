const submit = document.getElementById("submit");
const socket = io();

submit.addEventListener('click', () => {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    socket.emit('login', username, password);
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
});

socket.on("receiveID", (id) => {
    localStorage.setItem("id", id);
    window.location.href = 'post.html'; 
});

socket.on('redirect', (data) => {
    socket.emit("getID", (username));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', data.username);
    localStorage.setItem('conditions', data.cond);
    window.location.href = data.url;
});