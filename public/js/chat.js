const socket = io();

const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('user-message');
const sendButton = document.getElementById('send-btn');

socket.on('display message', (msgNom) => {
  socket.emit("check admin", msgNom);
});

socket.on("display message checked", (messageData) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add('h2__popup');
  messageElement.classList.add(messageData.check === "admin" ? "admin2-message" : "server-message");
  messageElement.textContent = messageData.message;
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});

function sendMessage(){
  const message = messageInput.value;
  if (message.trim() !== '') {
    const msgNom = {
      username: localStorage.getItem("username"),
      message: message
    };
    socket.emit('chat message', msgNom);
    messageInput.value = '';
  }
}

sendButton.addEventListener('click', () => {
  socket.emit('send message');
  sendMessage();
});

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

messageContainer.addEventListener('click', function (event) {
  const clickedElement = event.target.closest('.h2__popup');

  if (clickedElement && clickedElement.innerText !== "élèves") {
    console.log(clickedElement.innerText.split(" ")[0]);
    const data1 = {
      username: clickedElement.innerText.split(" ")[0],
      event: event
    };
    socks.emit("getUserEmail", (data1));
  }
});

socks.on("popup info", (data) => {
  console.log(data.username, data.event, data.email, data.admin);
  createPopupPost(data.username, data.event, data.email, data.admin);
});

function createPopupPost(username, event, email, admin) {
  const popupContainer = document.createElement('div');
  popupContainer.classList.add('popup');

  const closeButton = document.createElement('span');
  closeButton.classList.add('close');
  closeButton.innerHTML = '&times;'; // '×' symbol for close
  closeButton.addEventListener('click', function () {
    document.body.removeChild(popupContainer);
  });

  const content = document.createElement('div');
  content.classList.add('popup__div');
  content.innerHTML = `
    <p>Username: ${username}</p>
    <p>Email: ${email}</p>
  `;
  if(admin === "true"){
    content.innerHTML = `
    <p>Username: ${username}</p>
    <p>Email: ${email}</p>
    <p>Infos supplémentaires: Cet utilisateur est administrateur</p>
  `;
  }
  
  popupContainer.style.left = `${event.pageX}px`;
  popupContainer.style.top = `${event.pageY}px`;

  let isDragging = false;
  let offsetX, offsetY;

  popupContainer.addEventListener('mousedown', function (mousedownEvent) {
    isDragging = true;

    offsetX = mousedownEvent.clientX - popupContainer.getBoundingClientRect().left - 150;
    offsetY = mousedownEvent.clientY - popupContainer.getBoundingClientRect().top - 80;

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