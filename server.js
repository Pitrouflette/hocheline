const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const path = require('path');
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

app.use(express.static('public'));

let onlineCount = 0;
let sql;

const loginDB = new sqlite3.Database('public/db/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err) return console.error(err.message);
});

sql = 'CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username,password,email,admin)';
loginDB.run(sql);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {

  const clientIp = socket.handshake.address; 

  onlineCount++;

  io.emit('online count', onlineCount);


  socket.on('disconnect', () => {
    onlineCount--;
    io.emit('online count', onlineCount);
    console.log('Un client s\'est déconnecté');
  });

  socket.on('getIP', () => {
    return clientIp;
  });

  socket.on('chat message', (message) => {
    io.emit("display message", message);
  });

  socket.on('create_article', (articleHTML) => {
    socket.broadcast.emit('display_article', articleHTML);
  });

  // DATABASE HANDLER
  socket.on("login", (username, password) => {
    sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    loginDB.get(sql, [username, password], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if (row) {
        console.log("Identifiants valides. L'utilisateur " + username + " existe dans la base de données.");
        const data = {
          username: username,
          url: "http://82.121.132.29:3000/"
        };
        socket.emit('redirect', data);
      } else {
        console.log("Identifiants invalides. L'utilisateur n'existe pas ou le mot de passe est incorrect.");
      }
    });
  });
  socket.on("sign up", (userData) =>{
    const username = userData.username;
    const password = userData.password;
    const email = userData.email;
    sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    loginDB.run(sql, [username, password, email], (err) => {
      console.log(username, password, email);
      if (err) {
        console.error(err.message);
        return;
      }
    });
  });
  socket.on("check admin", (messageData) => {
    sql = "SELECT * FROM users WHERE username = ? AND admin = 'true'";
    loginDB.get(sql, [messageData.username], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if (row) {
        console.log(messageData.username + " est admin");
        messageData.check = "admin";
        messageData.message = messageData.username + " >> " + messageData.message;
        socket.emit("display message checked", messageData);
      } else {
        console.log(messageData.username + " n'est pas admin");
        messageData.check = "user";
        messageData.message = messageData.username + " >> " + messageData.message;
        socket.emit("display message checked", messageData);
      }
    });
  });
  
});

// Configuration de Multer pour spécifier où les fichiers téléchargés seront stockés
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images')); // Utilisez le chemin absolu du dossier 'images'
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Utilisez le nom d'origine du fichier
  },
});

const upload = multer({ storage: storage });

// Gérez le téléchargement de fichiers
app.post('/upload', upload.single('image'), (req, res) => {
  // Si tout se passe bien, le fichier sera téléchargé dans le dossier 'public/images'
  res.send('Fichier téléchargé avec succès !');
});

// Servez les fichiers statiques dans le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

http.listen(port, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${port}`);
});