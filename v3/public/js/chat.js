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