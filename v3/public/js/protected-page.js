const sockets = io();


if (localStorage.getItem('isLoggedIn') != "true") {
  console.log(localStorage.getItem('isLoggedIn'));
  window.location.href = 'login.html';
} else {
  loadHeader();
  //loadFooter();
}

sockets.on("sendData", (data) => {
  if(data.cond != "true"){
    window.location.href = 'conditions.html';
  }
  const nav = document.getElementById("nav");
  if (data.admin == "true") {
    nav.innerHTML = `
      <a href="home.html" class="nav-link">accueil</a>
      <a href="chat.html" class="nav-link">chat</a>
      <a href="post.html" class="nav-link">post</a>
      <a href="poster.html" class="nav-link">poster</a>
      <a href="profil.html" class="nav-link">compte</a>
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
      document.getElementById('title').innerHTML = "Hocheline - " + localStorage.getItem('username');
      
      // Et configurer la navigation selon les droits d'administrateur
      updateNavigation();
    } else {
      console.error('Erreur lors du chargement du header:', response.statusText);
    }
  } catch (error) {
    console.error('Erreur lors du chargement du header:', error);
  }
}

async function loadFooter() {
  try {
    const response = await fetch('../html/footer.html');
    if (response.ok) {
      const footerContent = await response.text();
      document.getElementById('footer-container').innerHTML = footerContent;
    } else {
      console.error('Erreur lors du chargement du footer:', response.statusText);
    }
  } catch (error) {
    console.error('Erreur lors du chargement du footer:', error);
  }
}