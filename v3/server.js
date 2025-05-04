const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const port = 3030;
const sqlite3 = require('sqlite3').verbose();
const chalk = require('chalk');
const figlet = require('figlet');

let onlineCount = 0;
let visitCount = 0;
let messageCount = 0;
let postCount = 0;
let sql;

var postVar = "";

const loginDB = new sqlite3.Database(__dirname + '/public/db/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err) return (console.error(err.message));
});

sql = 'CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username,password,admin,perms,cond)';
loginDB.run(sql);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/post.html');
});
app.use(express.static(path.join(__dirname, 'public/html')));
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

    fs.readFile('public/posts/post-raw.json', 'utf8', (err, data) => {
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
  
      fs.writeFile('public/posts/post-raw.json', updatedJsonContent, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('Erreur lors de l\'écriture du fichier JSON :', writeErr);
            return;
          }
      });
    });
  });

  socket.on("getPosts", () =>{
    fs.readFile('public/posts/post.json', 'utf8', (err, data) => {
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
        
      postVar = creerListeDepuisObjet(jsonData.elements);
      socket.emit("display post", postVar);
    });
  });

  socket.on("getRawPosts", () =>{
    fs.readFile('public/posts/post-raw.json', 'utf8', (err, data) => {
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

      postVar = creerListeDepuisObjet(jsonData.elements);
      io.emit("recieveRawPosts", postVar);
    });
  });

  socket.on("DiscaredPost", (index) =>{
    fs.readFile('public/posts/post-raw.json', 'utf8', (err, data) => {
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
      jsonData.elements.pop(index);
      const updatedJsonContent = JSON.stringify(jsonData, null, 2);
      fs.writeFile('public/posts/post-raw.json', updatedJsonContent, 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Erreur lors de l\'écriture du fichier JSON :', writeErr);
          return;
        }
      });
    });
  });

  socket.on("AgreedPost", (index) =>{
    fs.readFile('public/posts/post-raw.json', 'utf8', (err, data) => {
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
      agreedPost = creerListeDepuisObjet(jsonData.elements)[index];
      jsonData.elements.pop(index);
      const updatedJsonContent = JSON.stringify(jsonData, null, 2);
      fs.writeFile('public/posts/post-raw.json', updatedJsonContent, 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Erreur lors de l\'écriture du fichier JSON :', writeErr);
          return;
        }
      });
      
      fs.readFile('public/posts/post.json', 'utf8', (err, data) => {
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
          
        if(agreedPost){
          jsonData.elements.push({
            innerHTML: agreedPost
          });
        }
        
        const updatedJsonContent = JSON.stringify(jsonData, null, 2);
    
        fs.writeFile('public/posts/post.json', updatedJsonContent, 'utf8', (writeErr) => {
            if (writeErr) {
              console.error('Erreur lors de l\'écriture du fichier JSON :', writeErr);
              return;
            }
        });
      });
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
          url: "post.html",
          cond: row.cond
        };
        socket.emit('redirect', data);
      }
    });
  });

  socket.on("sign up", (userData) =>{
    const username = userData.username;
    const password = userData.password;
    sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    loginDB.run(sql, [username, password], (err) => {
      console.log(username, password);
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
    sql = "SELECT password, admin, cond FROM users WHERE username = ?";
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
    sql = "UPDATE users SET username = ?, password = ? WHERE username = ?";
    loginDB.run(sql, [data.username, data.password, data.old_username], (err, row) => {
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

  socket.on("getID", (username) => {
    const sql = 'SELECT id FROM users WHERE username = ? ';
    loginDB.get(sql, [username], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if(row){
        socket.emit("receiveID", row.id);
      }
    });
   });

   socket.on("checkUsername", (data) => {
    const sql = 'SELECT * FROM users WHERE username = ? ';
    loginDB.get(sql, [data.username], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if(row){
        socket.emit("UsernameAlreadyTaken");
      }else{
        socket.emit("signUpOK", (data));
      }
      
    });
   });

  socket.on("conditions acceptées", (data) => {
    sql = 'SELECT * FROM users WHERE username = ?';
    loginDB.get(sql, [data.sender_name], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if (row) {
        sql = "UPDATE users SET cond = ? WHERE username = ?";
        loginDB.run(sql, ["true", row.username], (err, row) => {
          if (err) {
            console.error(err.message);   //checkUsername
            return;
          }
          io.to(data.id).emit("condition acceptées redirection");
        });
      }
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

app.use(express.static(path.join(__dirname, 'public')));

http.listen(port, "0.0.0.0",() => {
  console.log('\n' + chalk.gray('────────────────────────────────────────────────────────────────────────────────────────\n'));

  console.log(chalk.magentaBright(figlet.textSync('Gossip Hoche', {font: 'ANSI Shadow',horizontalLayout: 'default',verticalLayout: 'default'})));
  
  console.log('\n' + chalk.bold.green('🚀 Serveur lancé avec succès !\n'));

  console.log(chalk.white('                   📡 Accès local     : ') + chalk.cyanBright(`http://localhost:${port}`));
  console.log(chalk.white('                   🌍 Accès externe   : ') + chalk.cyanBright(`http://88.127.129.62:${port}`));

  console.log('\n' + chalk.gray('────────────────────────────────────────────────────────────────────────────────────────\n'));
});
