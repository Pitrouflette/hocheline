const socks = io();
const container = document.getElementById("post-container");
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeButton = document.querySelector('.close-button');

socks.emit('register post', "");

socks.on("display post", (postList) => {
  var rumor = document.getElementById("post-container");
  rumor.innerHTML = "";
  for (var element of postList) {
    const article = document.createElement('div');
    article.classList.add("cta");
    article.innerHTML = element;
    rumor.appendChild(article);
  }
  
  // Appliquer les écouteurs d'événements après que les images sont chargées
  setupLightboxListeners();
});

// Fonction pour configurer les écouteurs d'événements du lightbox
function setupLightboxListeners() {
  // Sélectionner toutes les images avec la classe post-image
  const images = document.querySelectorAll('.post-image');
  
  // Ajouter un écouteur d'événement à chaque image
  images.forEach(image => {
    image.addEventListener('click', () => {
      lightboxImg.src = image.src;
      lightbox.classList.add('active');
    });
  });
}

// Fermer le lightbox quand on clique sur la croix
closeButton.addEventListener('click', () => {
  lightbox.classList.remove('active');
});

// Fermer le lightbox quand on clique en dehors de l'image
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove('active');
  }
});

// Fermer le lightbox avec la touche Echap
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('active')) {
    lightbox.classList.remove('active');
  }
});