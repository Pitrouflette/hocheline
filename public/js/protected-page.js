const greetHeader = document.getElementById('title');
const disconect = document.getElementById('deco');

if (localStorage.getItem('isLoggedIn') == "false") {
    
    window.location.href = 'login.html';
}else{
    if (window.innerWidth <= 768 && window.innerHeight <= 1024) {
        window.location = 'http://82.121.132.29:3000/phone.html';
    } else {
        greetHeader.innerHTML = "Hocheline - " + localStorage.getItem('username');
    } 
}

disconect.addEventListener('click', function(event){
    console.log("clicked");
    localStorage.setItem('isLoggedIn', "false");
    localStorage.setItem('username', "Username");
    window.location.href = 'login.html';
});