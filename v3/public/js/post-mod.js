const socks = io();
const container = document.getElementById("post-container");
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeButton = document.querySelector('.close-button');

socks.emit('register post');
socks.emit("getRawPosts");

socks.on("recieveRawPosts", (postList) => {
    var rumor = document.getElementById("post-container");
    rumor.innerHTML = "";
    const reversedPosts = postList.slice().reverse();
  
    reversedPosts.forEach((element, index) => {
      const discare = document.createElement("i");
      discare.classList = "discare fa-solid fa-thumbs-down";
  
      const agree = document.createElement("i");
      agree.classList = "agree fa-solid fa-thumbs-up";

      discare.addEventListener("click", () => {
        socks.emit("DiscaredPost", index);
        location.reload();
      });
  
      agree.addEventListener("click", () => {
        socks.emit("AgreedPost", index);
        location.reload();
      });
  
      const article = document.createElement('div');
      article.classList.add("cta");
      article.innerHTML = element;
      article.appendChild(discare);
      article.appendChild(agree);
      rumor.appendChild(article);
    });
  });
  