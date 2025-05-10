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
    if (postList.length === 0){
      NoPostYet = document.createElement("h1");
      NoPostYet.innerHTML = "No posts pending validation ...";
      NoPostYet.style = "text-align: center;";
      container.appendChild(NoPostYet);
      return;
    }
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
      div_vote = document.createElement("div");
      div_vote.classList = "vote_div"
      div_vote.appendChild(discare);
      div_vote.appendChild(agree);
      article.appendChild(div_vote);
      rumor.appendChild(article);
    });
  });
  