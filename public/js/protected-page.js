const greetHeader = document.getElementById('title');
var popup = document.getElementById("h2__popup");


if (localStorage.getItem('isLoggedIn') == "false") {
    
    window.location.href = 'login.html';
}else{
    if (window.innerWidth <= 768 && window.innerHeight <= 1024) {
        window.location = 'http://82.121.132.29:3000/phone.html';
    } else {
        greetHeader.innerHTML = "Hocheline - " + localStorage.getItem('username');
    } 
}

popup.addEventListener('click', function(event) {
    createPopup(event);
}); 
  

function createPopup(event) {
    // Create popup container
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup');
  
    // Create close button
    const closeButton = document.createElement('span');
    closeButton.classList.add('close');
    closeButton.innerHTML = '&times;'; // '×' symbol for close
    closeButton.addEventListener('click', function () {
      document.body.removeChild(popupContainer);
    });
  
    // Create content
    const content = document.createElement('div');
    content.classList.add('popup__div');
    content.innerHTML = `
      <p>Ce site a été créé par</p>
      <h3>Charles Dubesset en 2nd7</h3>
    `;
  
    // Set the initial position of the popup
    popupContainer.style.left = `${event.pageX}px`;
    popupContainer.style.top = `${event.pageY}px`;
  
    // Variables for tracking mouse movement
    let isDragging = false;
    let offsetX, offsetY;
  
    // Event listener for mouse down to start dragging
    popupContainer.addEventListener('mousedown', function (mousedownEvent) {
      isDragging = true;
  
      // Calculate the initial offset from the mouse position to the popup position
      offsetX = mousedownEvent.clientX - popupContainer.getBoundingClientRect().left - 121;
      offsetY = mousedownEvent.clientY - popupContainer.getBoundingClientRect().top - 65;
  
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
    });
  
    // Event listener for mouse up to stop dragging
    document.addEventListener('mouseup', function () {
      isDragging = false;
  
      // Allow text selection after drag
      document.body.style.userSelect = '';
    });
  
    // Event listener for mouse move to update popup position
    document.addEventListener('mousemove', function (mousemoveEvent) {
      if (isDragging) {
        // Update the position of the popup based on the mouse movement
        popupContainer.style.left = `${mousemoveEvent.clientX - offsetX}px`;
        popupContainer.style.top = `${mousemoveEvent.clientY - offsetY}px`;
      }
    });
  
    // Append close button and content to the popup container
    popupContainer.appendChild(closeButton);
    popupContainer.appendChild(content);
  
    // Append popup container to the body
    document.body.appendChild(popupContainer);
  }
  