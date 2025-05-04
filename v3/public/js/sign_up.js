const submit = document.getElementById("submit");
const socket = io();

submit.addEventListener('click', () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const password_conf = document.getElementById("password-conf").value;

    if (password !== password_conf){
        afficherNotification("Passwords not matching...")
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        document.getElementById("password-conf").value = "";
    }else{
        const userData = {
            username: username,
            password: password
        };

        socket.emit("sign up", userData);
        socket.emit("login", username, password);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        socket.emit("getID", (username));
    }

    socket.on("receiveID", (id) => {
        localStorage.setItem("id", id);
        window.location.href = 'post.html'; 
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

});