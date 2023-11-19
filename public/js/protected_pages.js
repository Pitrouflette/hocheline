const greetHeader = document.getElementById('romor-title');

if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}else{
    greetHeader.innerHTML = "Bienvenue " + localStorage.getItem('username') + " !";
}