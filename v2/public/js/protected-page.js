const sockets = io();
const greetHeader = document.getElementById('title');
const nav = document.getElementById("nav");
var popup = document.getElementById("h2__popup");


if (localStorage.getItem('isLoggedIn') == "false") {
    
    window.location.href = 'login.html';
}else{
    if (window.innerWidth <= 768 && window.innerHeight <= 1024) {
        window.location = '/phone.html';
    } else {
        greetHeader.innerHTML = "Hocheline - " + localStorage.getItem('username');
    } 
}

sockets.emit("getUserData", localStorage.getItem('username'));

sockets.on("sendData", (data) => {
  if (data.admin == "true"){
    nav.innerHTML = `
      <a href="index.html">accueil</a>
      <a href="chat.html">chat</a>
      <a href="post.html">post</a>
      <a href="poster.html">poster</a>
      <a href="profil.html">compte</a>
      <a href="admin.html">admin panel</a>
    `;
  }
});

popup.addEventListener('click', function(event) {
    createPopup(event);
}); 

function createPopup(event) {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup');
  
    const closeButton = document.createElement('span');
    closeButton.classList.add('close');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', function () {
      document.body.removeChild(popupContainer);
    });

    const content = document.createElement('div');
    content.classList.add('popup__div');
    content.innerHTML = `
      <p>Ce site a été créé par</p>
      <h3>Charles Dubesset en 2nd7</h3>
    `;
  
    popupContainer.style.left = `${event.pageX}px`;
    popupContainer.style.top = `${event.pageY}px`;
  
    let isDragging = false;
    let offsetX, offsetY;

    popupContainer.addEventListener('mousedown', function (mousedownEvent) {
      isDragging = true;

      offsetX = mousedownEvent.clientX - popupContainer.getBoundingClientRect().left - 121;
      offsetY = mousedownEvent.clientY - popupContainer.getBoundingClientRect().top - 65;

      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mouseup', function () {
      isDragging = false;

      document.body.style.userSelect = '';
    });

    document.addEventListener('mousemove', function (mousemoveEvent) {
      if (isDragging) {
        popupContainer.style.left = `${mousemoveEvent.clientX - offsetX}px`;
        popupContainer.style.top = `${mousemoveEvent.clientY - offsetY}px`;
      }
    });
  
    popupContainer.appendChild(closeButton);
    popupContainer.appendChild(content);

    document.body.appendChild(popupContainer);
  }
  