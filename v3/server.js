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

app.use(express.static('public/html'));

let onlineCount = 0;
let visitCount = 0;
let messageCount = 0;
let postCount = 0;
let sql;

var postVar = "";

const loginDB = new sqlite3.Database('public/db/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err) return console.error(err.message);
});

sql = 'CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username,password,email,admin,friends,perms,cond)';
loginDB.run(sql);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/home.html');
});

io.on('connection', (socket) => {

  const clientIp = socket.handshake.address; 

  onlineCount++;
  visitCount++;

  io.emit('display post', postVar);

  socket.on('disconnect', () => {
    onlineCount--;
  });

  socket.on('getIP', () => {
    return clientIp;
  });

  socket.on('chat message', (msgNom) => {
    messageCount++;
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
          if (data.trim() !== '') {
              try {
                jsonData = JSON.parse(data);
              } catch (jsonErr) {
                console.error('Erreur lors de l\'analyse du JSON existant :', jsonErr);
                return;
              }
          }
      }
      if (!jsonData.elements) {
          jsonData.elements = [];
      }
        
      if(innerHTML){
        jsonData.elements.push({
          innerHTML: innerHTML
        });
      }
      
      const updatedJsonContent = JSON.stringify(jsonData, null, 2);
  
      fs.writeFile(filePath, updatedJsonContent, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('Erreur lors de l\'écriture du fichier JSON :', writeErr);
            return;
          }
      });
      postVar = creerListeDepuisObjet(jsonData.elements);
      io.emit("display post", postVar);
    });
  });

  socket.on("postIncreas", () =>{
    postCount++;
  });

  socket.on("admin data", () => {
    let data = {
      onlines: onlineCount,
      visiters: visitCount,
      messages: messageCount,
      posts: postCount
    };
    socket.emit("admin", data);
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
        const data = {
          username: username,
          password: password,
          url: "home.html"
        };
        socket.emit('redirect', data);
      }
    });
  });
  socket.on("add friend", (data) => {
    const username = data.sender;
    const id = data.id;
    const newFriend = data.friend;

    const sqlSelect = "SELECT friends FROM users WHERE username = ?";
    loginDB.get(sqlSelect, [username], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if (row) {
        let currentFriends = "initial state";
        if (row.friends.includes(",")){
          currentFriends = row.friends.split(",");
        }else{
          currentFriends = row.friends;
        }
        
        console.log(currentFriends);
  
        if (currentFriends.includes(newFriend)) {
          io.to(id).emit("friend already added", newFriend);
        } else {
  
          const updatedFriends = currentFriends + "," + newFriend;
          const sqlUpdate = "UPDATE users SET friends = ? WHERE username = ?";
  
          loginDB.run(sqlUpdate, [updatedFriends, username], function (err) {
            if (err) {
              console.error(err.message);
              return;
            }

            if (this.changes > 0) {
              const sqlSelect2 = "SELECT friends FROM users WHERE username = ?";
              loginDB.get(sqlSelect2, [newFriend], (err, row) => {
                if (err) {
                  console.error(err.message);
                  return;
                }if(row){
                  if(row.friends.includes(username)) {
                    io.to(id).emit("friend added", newFriend);
                  }else{
                    io.to(id).emit("friend added waiting", newFriend);
                  }
                }else{
                  io.to(id).emit("wrong name", newFriend);
                }
              });
            } else {
              io.to(id).emit("update failed", newFriend);
            }
          });
        }
      } else {
        io.to(id).emit("wrong name", newFriend);
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
      const data = {
        username: username,
        password: password,
        url: "http://192.168.1.35:3000/"
      };
      socket.emit('redirect', data);
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
  socket.on("getUserData", (username) => {
    sql = "SELECT email, password, admin, friends FROM users WHERE username = ?";
    loginDB.get(sql, [username], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if (row) {
        socket.emit("fill edit form", row);
        socket.emit("sendData", row);
      }
    });
  });
  socket.on("edit profil", (data) => {
    sql = "UPDATE users SET username = ?, email = ?, password = ? WHERE username = ?";
    loginDB.run(sql, [data.username, data.email, data.password, data.old_username], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      socket.emit("profil edited", data);
    });
  });
  socket.on("delete profil", (username) => {
    sql = "DELETE FROM users WHERE username = ?";
    loginDB.run(sql, [username], (err, row) => {
       if (err) {
         console.error(err.message);
         return;
       }
       socket.emit("profil deleted", username);
    });
   });
  socket.on("getDB", () => {
   const sql = 'SELECT * FROM users';
   loginDB.all(sql, [], (err, rows) => {
     if (err) {
       console.error(err.message);
       return;
     }
     socket.emit('recive DB', rows);
   });
  });
});

function creerListeDepuisObjet(obj) {
  try {
    if (Array.isArray(obj)) {
      const liste = [];

      obj.forEach((element) => {
        if (element.innerHTML) {
          liste.push(element.innerHTML);
        } else {
          liste.push('[Object sans propriété nom]');
        }
      });

      return liste;
    } else {
      console.error('L\'objet ne représente pas un tableau.');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la création de la liste :', error);
    return null;
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  res.send('Fichier téléchargé avec succès !');
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`██   ██  ██████   ██████ ██   ██ ███████ ██      ██ ███    ██ ███████     ██     ██ ███████ ██████   █████  ██████  ██████  
██   ██ ██    ██ ██      ██   ██ ██      ██      ██ ████   ██ ██          ██     ██ ██      ██   ██ ██   ██ ██   ██ ██   ██ 
███████ ██    ██ ██      ███████ █████   ██      ██ ██ ██  ██ █████       ██  █  ██ █████   ██████  ███████ ██████  ██████  
██   ██ ██    ██ ██      ██   ██ ██      ██      ██ ██  ██ ██ ██          ██ ███ ██ ██      ██   ██ ██   ██ ██      ██      
██   ██  ██████   ██████ ██   ██ ███████ ███████ ██ ██   ████ ███████      ███ ███  ███████ ██████  ██   ██ ██      ██      
                                                                                                                            
                                                                                                                            `);
});

http.listen(port, '0.0.0.0', () => {
  console.log(`Serveur bien démarré sur le port ${port}`);
});
