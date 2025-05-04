const socks = io();
const container = document.getElementById("post-container");
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeButton = document.querySelector('.close-button');

socks.emit('register post', "");

socks.on("display post", (postList) => {
  var rumor = document.getElementById("post-container");
  rumor.innerHTML = "";
  for (var element of postList.slice().reverse()) {
    const article = document.createElement('div');
    article.classList.add("cta");
    article.innerHTML = element;
    rumor.appendChild(article);
  }
});