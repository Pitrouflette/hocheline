const socks = io();
const container = document.getElementById("post-container");
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeButton = document.querySelector('.close-button');

socks.emit('getPosts');

socks.on("display post", (postList) => {
  container.innerHTML = "";
  if (postList.length === 0){
    NoPostYet = document.createElement("h1");
    NoPostYet.innerHTML = "No post to display yet ...";
    NoPostYet.style = "text-align: center;";
    container.appendChild(NoPostYet);
    return;
  }
  for (var element of postList.slice().reverse()) {
    const article = document.createElement('div');
    article.classList.add("cta");
    article.innerHTML = element;
    container.appendChild(article);
  }
});