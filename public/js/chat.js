const socket = io();

const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('user-message');
const sendButton = document.getElementById('send-btn');
const articlesContainer = document.getElementById('rumor-container');
const welcomeText = document.getElementById('romor-title').textContent;

socket.on('display message', (message) => {
  const messageData = {
    username: localStorage.getItem('username'),
    message: message
  };
  socket.emit("check admin", messageData);

});

socket.on("display message checked", (messageData) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(messageData.check === "admin" ? "admin2-message" : 'server-message');
  messageElement.textContent = messageData.message;
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});

socket.on('online count', (onlineCount) => {
  const onlineCountElement = document.getElementById('online-count');
  onlineCountElement.title = `${onlineCount/2} connecté(es) 🔴`;
});

socket.on('display_article', (articleHTML) => {
  const articleElement = document.createElement('article');
  articleElement.innerHTML = articleHTML;
  articlesContainer.appendChild(articleElement);
  localStorage.setItem('article', articleHTML);
});

function sendMessage(){
  const message = messageInput.value;
  if (message.trim() !== '') {
    socket.emit('chat message', message);
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

window.addEventListener('load', function () {
  greetHeader.innerHTML = "Bienvenue " + localStorage.getItem('username') + " !";
});