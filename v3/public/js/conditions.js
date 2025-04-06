const socket = io();

button_accept = document.getElementById("accepter");

button_accept.addEventListener('click', function(event){
    let data = {
        'sender_name': localStorage.getItem("username"),
        'id': socket.id
    }
    socket.emit("conditions acceptées", data);
});

socket.on("condition acceptées redirection", () =>{
    window.location.href = 'home.html';
});