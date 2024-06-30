const disconect = document.getElementById('deco');
const username = document.getElementById('username-input');
const email = document.getElementById('email-input');
const password = document.getElementById('password-input');
const submit = document.getElementById('submit');
const delete_profil = document.getElementById('delete');
const friend_button = document.getElementById('add-friend');
const friend_name = document.getElementById('name-friend');
const friend_list = document.getElementById('freind-list');
const socket = io();

socket.emit("getUserData", localStorage.getItem("username"));

socket.on("fill edit form", (row) => {
  username.value = localStorage.getItem('username');
  email.value = row.email;
  password.value = row.password;
  for (friend in row.friends.split(",")){
    friend_list.innerHTML += `<a class="messagable" href="#"> • ${row.friends.split(",")[friend]}</a>`;
  }

  if (friend_list) {
      var collection = [];

      for (var i = 0; i < friend_list.childNodes.length; i++) {
          var childNode = friend_list.childNodes[i];
          if (childNode.nodeType === Node.ELEMENT_NODE && childNode.tagName === 'A') {
            collection.push(childNode);
          }
      }
      console.log(collection);
      addClickEvent(collection);
  }
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

socket.on("profil deleted", (username) => {
    localStorage.setItem('username', "");
    localStorage.setItem('password', "");
    localStorage.setItem('email', "");
    localStorage.setItem('isLoggedIn', "false");
    window.location.reload();
});

// FRIEND MANAGEMENT

socket.on('wrong name', (friend) =>{
    afficherNotification("l'utilisateur " +  friend + "  n'existe pas !");
});
socket.on('update failed', (friend) =>{
    afficherNotification("Impossible d'ajouter " +  friend + " comme ami(e)...");
});
socket.on('friend added', (friend) =>{
    afficherNotification("Vous êtes maintenant ami(e) avec " +  friend + " !!");
    socket.emit("getUserData", localStorage.getItem("username"));
});
socket.on('friend already added', (friend) =>{
    afficherNotification("Vous êtes déjà ami(e) avec " +  friend + " !!");
});
socket.on('friend added waiting', (friend) =>{
    afficherNotification("Vous avez ajouter " +  friend + " comme ami(e), pour pouvoir communiquer avec lui, il faut qu'il vous ajoute a son tour !");
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

friend_button.addEventListener('click', function(event){
    let data = {
        'friend': friend_name.value,
        'sender': localStorage.getItem('username'),
        'id': socket.id
    }
    friend_name.value = "";
    socket.emit('add friend', (data));
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

function openChatWindow(element) {
    var chatWindow = document.createElement("div");
    chatWindow.id = "chat-window";
    var chatHeader = document.createElement("div");
    chatHeader.id = "chat-header";
    chatHeader.textContent = "Fenêtre de Chat";
    var chatBody = document.createElement("div");
    chatBody.id = "chat-body";
    var chatInput = document.createElement("input");
    chatInput.type = "text";
    chatInput.id = "chat-input";
    chatInput.placeholder = "Tapez votre message...";
    var chatSendButton = document.createElement("button");
    chatSendButton.id = "chat-send";
    chatSendButton.textContent = "Envoyer";
    //chatSendButton.onclick = envoyerMessage;
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(chatBody);
    chatWindow.appendChild(chatInput);
    chatWindow.appendChild(chatSendButton);
    document.body.appendChild(chatWindow);

    dragElement(document.getElementById("chat-window"));

  function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "-header")) {
      document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
    } else {
      elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
};

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

function addClickEvent(collection) {
  for (var i = 0; i < collection.length; i++) {
    collection[i].addEventListener('click', function() {
      openChatWindow(collection[i]);
    });
  }
}

