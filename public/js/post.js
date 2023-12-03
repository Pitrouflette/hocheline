const socks = io();

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