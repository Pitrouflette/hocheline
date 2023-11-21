const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const path = require('path');
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

const filePath = 'public/posts/post.json';

app.use(express.static('public'));

let onlineCount = 0;
let sql;

var postVar = "";

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
  io.emit("display post", postVar);

  socket.on('disconnect', () => {
    onlineCount--;
    io.emit('online count', onlineCount);
  });

  socket.on('getIP', () => {
    return clientIp;
  });

  socket.on('chat message', (msgNom) => {
    io.emit("display message", msgNom);
  });

  socket.on('register post', (innerHTML) => {

    fs.readFile(filePath, 'utf8', (err, data) => {
      let jsonData = {};
  
      if (err) {
          if (err.code !== 'ENOENT') {
              console.error('Erreur lors de la lecture du fichier JSON :', err);
              return;
          }
      } else {
          // Vérifier si la chaîne JSON n'est pas vide
          if (data.trim() !== '') {
              // Analyser le JSON existant
              try {
                  jsonData = JSON.parse(data);
              } catch (jsonErr) {
                  console.error('Erreur lors de l\'analyse du JSON existant :', jsonErr);
                  return;
              }
          }
      }
      // Vérifier si la propriété 'elements' existe dans le JSON
      if (!jsonData.elements) {
          jsonData.elements = [];
      }
  
      // Ajouter le nouvel élément au tableau 'elements'
      jsonData.elements.push({
          innerHTML: innerHTML
      });
  
      // Convertir l'objet JavaScript en JSON
      const updatedJsonContent = JSON.stringify(jsonData, null, 2);
  
      // Réécrire le fichier avec les nouvelles données
      fs.writeFile(filePath, updatedJsonContent, 'utf8', (writeErr) => {
          if (writeErr) {
              console.error('Erreur lors de l\'écriture du fichier JSON :', writeErr);
              return;
          }
          console.log('Nouvel élément ajouté avec succès au fichier JSON.');
      });
      postVar = creerListeDepuisObjet(jsonData.elements);
      io.emit("display post", postVar);
    });
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
        messageData.check = "admin";
        messageData.message = messageData.username + " >>> " + messageData.message;
        socket.emit("display message checked", messageData);
      } else {
        messageData.check = "user";
        messageData.message = messageData.username + " >>> " + messageData.message;
        socket.emit("display message checked", messageData);
      }
    });
  });
});

function creerListeDepuisObjet(obj) {
  try {
    // Vérifiez si l'objet est un tableau (liste)
    if (Array.isArray(obj)) {
      // Créez une liste (ul) dans le document HTML
      const liste = [];

      // Parcourez chaque élément du tableau et ajoutez-le à la liste
      obj.forEach((element) => {
        if (element.innerHTML) {
          liste.push(element.innerHTML);
        } else {
          // Si l'objet n'a pas de propriété 'nom', ajoutez une représentation par défaut
          liste.push('[Object sans propriété nom]');
        }
      });

      // Retournez la liste
      return liste;
    } else {
      console.error('L\'objet ne représente pas un tableau.');
      return null; // ou une autre valeur par défaut
    }
  } catch (error) {
    console.error('Erreur lors de la création de la liste :', error);
    return null; // ou une autre valeur par défaut
  }
}

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
  console.log(`██   ██  ██████   ██████ ██   ██ ███████ ██      ██ ███    ██ ███████     ██     ██ ███████ ██████   █████  ██████  ██████  
██   ██ ██    ██ ██      ██   ██ ██      ██      ██ ████   ██ ██          ██     ██ ██      ██   ██ ██   ██ ██   ██ ██   ██ 
███████ ██    ██ ██      ███████ █████   ██      ██ ██ ██  ██ █████       ██  █  ██ █████   ██████  ███████ ██████  ██████  
██   ██ ██    ██ ██      ██   ██ ██      ██      ██ ██  ██ ██ ██          ██ ███ ██ ██      ██   ██ ██   ██ ██      ██      
██   ██  ██████   ██████ ██   ██ ███████ ███████ ██ ██   ████ ███████      ███ ███  ███████ ██████  ██   ██ ██      ██      
                                                                                                                            
                                                                                                                            `);
});

http.listen(port, '0.0.0.0', () => {
  console.log(`Serveur est bien démarré sur le port ${port}`);
});