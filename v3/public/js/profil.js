const disconect = document.getElementById('deco');
const username = document.getElementById('username-input');
const password = document.getElementById('password-input');
const submit = document.getElementById('submit');
const delete_profil = document.getElementById('delete');
const socket = io();

socket.emit("getUserData", localStorage.getItem("username"));

socket.on("fill edit form", (row) => {
  username.value = localStorage.getItem('username');
  password.value = row.password;
  localStorage.setItem('password', row.password);
});

socket.on("profil edited", (data) => {
    localStorage.setItem('username', data.username);
    localStorage.setItem('password', data.password);
    username.value = localStorage.getItem('username');
    password.value = localStorage.getItem('password');
    window.location.reload();
});

socket.on("profil deleted", (username) => {
    localStorage.setItem('username', "");
    localStorage.setItem('password', "");
    localStorage.setItem('isLoggedIn', "false");
    window.location.reload();
});

submit.addEventListener('click', function(event){
    if(localStorage.getItem("username") !== username.value || localStorage.getItem("password") !== password.value){
        const data = {
            old_username: localStorage.getItem("username"),
            username: username.value,
            password: password.value
        };
        if(localStorage.getItem("username") !== username.value){
            socket.emit("checkUsername", (data));
        }else{
            socket.emit("edit profil", data);
        }
    }
});

socket.on("signUpOK", (data) => {
    socket.emit("edit profil", data);
});

socket.on("UsernameAlreadyTaken", () =>{
    afficherNotification("This username is already taken...")
});

delete_profil.addEventListener('click', function(event){
    if (window.confirm("Are you sure you want to delete your account ?")){
        socket.emit("delete profil", localStorage.getItem('username'));
    }
});

disconect.addEventListener('click', function(event){
    localStorage.setItem('isLoggedIn', "false");
    localStorage.setItem('username', "Username");
    window.location.href = 'login.html';
});

function afficherNotification(message) {

    var notification = document.createElement('div');
    notification.innerHTML = message;
    notification.style.backgroundColor = 'orange';
    notification.style.padding = '10px';
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.zIndex = '9999';
  
    document.body.appendChild(notification);

    setTimeout(function() {
      document.body.removeChild(notification);
    }, 5000);
}

