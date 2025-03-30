const socks = io();

const submit = document.querySelector('.submit');

submit.addEventListener('click', () => {

  var titleInput = document.getElementById('title-input');
  var descriptionInput = document.getElementById('description');
  var imageInput = document.getElementById('image');
  
  var titleValue = titleInput.value;
  var descriptionValue = descriptionInput.value;
  var selectedFile = imageInput.files[0];

   var formData = new FormData();
   formData.append('title', titleValue);
   formData.append('description', descriptionValue);
   formData.append('image', selectedFile);
  
   fetch('/upload', {
     method: 'POST',
     body: formData,
   })
     .then((response) => response.text())
     .then((data) => {
       console.log(data); 
     })
     .catch((error) => {
       console.error('Erreur:', error);
     });

  var article = document.createElement('div');
  article.classList.add('cta');
  var textColumn = document.createElement('div');
  textColumn.classList.add('cta__text-column');
  var h2 = document.createElement('h2');
  h2.classList.add("h2__popup")
  if (titleValue) {
    h2.textContent = localStorage.getItem("username") + " >>> " + titleValue;
  }
  var p = document.createElement('p');
  if (descriptionValue) {
    p.textContent = descriptionValue;
  }
  var img = document.createElement('img');
  img.classList.add("post-image")
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
  window.location.href = "post.html";
});