const socks = io();

const submit = document.querySelector('.submit');

socket.on("display post", (postList) => {
  console.log(postList);
  var rumor = document.getElementById("rumor-container");
  rumor.innerHTML = "";
  for (var element of postList) {
    console.log(element);
    const article = document.createElement('article');
    article.innerHTML = element;
    rumor.appendChild(article);
  }  
});

submit.addEventListener('click', () => {

  var titleInput = document.getElementById('title');
  var descriptionInput = document.getElementById('description');
  var imageInput = document.getElementById('image');
  
  // Obtenez les valeurs des champs d'entrée
  var titleValue = titleInput.value;
  var descriptionValue = descriptionInput.value;
  var selectedFile = imageInput.files[0];

   // Créez un objet FormData pour envoyer le fichier au serveur
   var formData = new FormData();
   formData.append('title', titleValue);
   formData.append('description', descriptionValue);
   formData.append('image', selectedFile);
 
   // Utilisez fetch pour envoyer le formulaire au serveur
   fetch('/upload', {
     method: 'POST',
     body: formData,
   })
     .then((response) => response.text())
     .then((data) => {
       console.log(data); // Affiche la réponse du serveur
     })
     .catch((error) => {
       console.error('Erreur:', error);
     });

  if(!titleValue){
    return;
  }
  if(!descriptionValue){
    return;
  }
  if(!selectedFile){
    return;
  }

  var article = document.createElement('article');
  article.classList.add('cta');
  var rumor = document.getElementById("rumor-container");
  rumor.appendChild(article);
  var textColumn = document.createElement('div');
  textColumn.classList.add('cta__text-column');
  var h2 = document.createElement('h2');
  if (titleValue) {
    h2.textContent = titleValue;
  }
  var p = document.createElement('p');
  if (descriptionValue) {
    p.textContent = descriptionValue;
  }
  var img = document.createElement('img');
  if (selectedFile) {
    var imageUrl = URL.createObjectURL(selectedFile);
    img.src = "../images/" + selectedFile.name;
  }
  textColumn.appendChild(h2);
  textColumn.appendChild(p);
  article.appendChild(img);
  article.appendChild(textColumn);

  socks.emit("register post", article.innerHTML);
  
  titleInput.value = "";
  descriptionInput.value = "";
  imageInput.value = "";

  window.location.reload();

});