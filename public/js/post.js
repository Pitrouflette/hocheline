const socks = io();
const container = document.getElementById("post-container");
const popups = document.getElementsByClassName("h2__popup");

socks.emit('register post', "")

socks.on("display post", (postList) => {
  var rumor = document.getElementById("post-container");
  rumor.innerHTML = "";
  for (var element of postList) {
    const article = document.createElement('div');
    article.classList.add("cta");
    article.innerHTML = element;
    rumor.appendChild(article);
  }  
});

container.addEventListener('click', function (event) {
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
