const sockets = io();

sockets.emit("getID", (localStorage.getItem("username")));

sockets.on("receiveID", (id) => {
  localStorage.setItem("id", id);
});

if (localStorage.getItem('isLoggedIn') != "true") {
  window.location.href = 'login.html';
} else {
  loadHeader();
}

sockets.on("sendData", (data) => {
  if(data.cond != "true"){
    window.location.href = 'conditions.html';
  }
  const nav = document.getElementById("nav");
  if (data.admin == "true") {
    nav.innerHTML = `
      <a href="post.html" class="nav-link"><i class='fas fa-home' ></i> home</a>
      <a href="chat.html" class="nav-link"><i class='fas fa-comment-dots'></i> chat</a>
      <a href="poster.html" class="nav-link"><i class='fas fa-plus'></i> tells</a>
      <a href="profil.html" class="nav-link"><i class='fas fa-user-circle' ></i> account</a>
      <a href="post-moderation.html" class="nav-link admin"><i class="fa-solid fa-gavel"></i> Posts Moderation</a>
      <a href="admin.html" class="nav-link admin"><i class="fa-solid fa-crown"></i> admin panel</a>
    `;
  }
});

function updateNavigation() {
  sockets.emit("getUserData", localStorage.getItem('username'));
}

async function loadHeader() {
  try {
    const response = await fetch('../html/header.html');
    if (response.ok) {
      const headerContent = await response.text();
      document.getElementById('header-container').innerHTML = headerContent;
      
      // Maintenant que le header est chargé, nous pouvons accéder à l'élément title
      document.getElementById('title').innerHTML = "#" + localStorage.getItem('id');
      
      // Et configurer la navigation selon les droits d'administrateur
      updateNavigation();
    } else {
      console.error('Erreur lors du chargement du header:', response.statusText);
    }
  } catch (error) {
    console.error('Erreur lors du chargement du header:', error);
  }
}