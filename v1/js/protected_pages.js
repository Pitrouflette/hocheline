const greetHeader = document.getElementById('title');

if (!localStorage.getItem('isLoggedIn')) {
    
    window.location.href = 'login.html';
}else{
    if (window.innerWidth <= 768 && window.innerHeight <= 1024) {
        window.location = 'http://82.121.132.29:3000/phone.html';
    } else {
        greetHeader.innerHTML = "Hocheline - " + localStorage.getItem('username');
    } 
}