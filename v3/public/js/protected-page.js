const sockets = io();

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
  console.log(data.admin);
  if (data.admin == "true") {
    nav.innerHTML = `
      <a href="post.html" class="nav-link">home</a>
      <a href="chat.html" class="nav-link">chat</a>
      <a href="poster.html" class="nav-link">tell</a>
      <a href="profil.html" class="nav-link">account</a>
      <a href="admin.html" class="nav-link admin">admin panel</a>
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