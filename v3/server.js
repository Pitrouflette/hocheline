// server.js
const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
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
let postVar = "";

const loginDB = new sqlite3.Database(__dirname + '/public/db/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);
});

loginDB.serialize(() => {
  sql = 'CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username,password,admin,perms,cond)';
  loginDB.run(sql);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/post.html');
});

app.use(express.static(path.join(__dirname, 'public/html')));

io.on('connection', (socket) => {
  const clientIp = socket.handshake.address;
  onlineCount++;

  io.emit('display post', postVar);

  socket.on('disconnect', () => {
    onlineCount--;
  });

  socket.on('register post', async (innerHTML) => {
    try {
      const filePath = 'public/posts/post-raw.json';
      let jsonData = { elements: [] };

      if (fs.existsSync(filePath)) {
        const data = await fsp.readFile(filePath, 'utf8');
        jsonData = JSON.parse(data || '{}');
        jsonData.elements = jsonData.elements || [];
      }

      if (innerHTML) jsonData.elements.push({ innerHTML });

      await fsp.writeFile(filePath, JSON.stringify(jsonData, null, 2));
    } catch (err) {
      console.error('Erreur dans register post :', err);
    }
  });

  socket.on("getPosts", async () => {
    visitCount++;
    try {
      const data = await fsp.readFile('public/posts/post.json', 'utf8');
      const jsonData = JSON.parse(data || '{}');
      postVar = creerListeDepuisObjet(jsonData.elements || []);
      socket.emit("display post", postVar);
    } catch (err) {
      console.error("Erreur getPosts:", err);
    }
  });

  socket.on("getRawPosts", async () => {
    try {
      const data = await fsp.readFile('public/posts/post-raw.json', 'utf8');
      const jsonData = JSON.parse(data || '{}');
      postVar = creerListeDepuisObjet(jsonData.elements || []);
      io.emit("recieveRawPosts", postVar);
    } catch (err) {
      console.error("Erreur getRawPosts:", err);
    }
  });

  socket.on("DiscaredPost", async (index) => {
    try {
      const filePath = 'public/posts/post-raw.json';
      const data = await fsp.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      jsonData.elements = jsonData.elements || [];
      jsonData.elements.splice(index, 1);
      await fsp.writeFile(filePath, JSON.stringify(jsonData, null, 2));
    } catch (err) {
      console.error("Erreur DiscaredPost:", err);
    }
  });

  socket.on("AgreedPost", async (index) => {
    postCount++;
    try {
      const rawPath = 'public/posts/post-raw.json';
      const postPath = 'public/posts/post.json';

      const rawData = JSON.parse(await fsp.readFile(rawPath, 'utf8'));
      const agreedPost = creerListeDepuisObjet(rawData.elements || [])[index];
      rawData.elements.splice(index, 1);
      await fsp.writeFile(rawPath, JSON.stringify(rawData, null, 2));

      const postData = JSON.parse(await fsp.readFile(postPath, 'utf8') || '{}');
      postData.elements = postData.elements || [];
      if (agreedPost) postData.elements.push({ innerHTML: agreedPost });
      await fsp.writeFile(postPath, JSON.stringify(postData, null, 2));
    } catch (err) {
      console.error("Erreur AgreedPost:", err);
    }
  });

  socket.on("admin data", () => {
    socket.emit("admin", {
      onlines: onlineCount,
      visiters: visitCount,
      messages: messageCount,
      posts: postCount
    });
  });

  // === SQLITE SERIALIZED ACCESS ===
  socket.on("login", (username, password) => {
    loginDB.serialize(() => {
      sql = "SELECT * FROM users WHERE username = ? AND password = ?";
      loginDB.get(sql, [username, password], (err, row) => {
        if (err) return console.error(err.message);
        if (row) socket.emit('redirect', { username, password, url: "post.html", cond: row.cond });
      });
    });
  });

  socket.on("sign up", (userData) => {
    loginDB.serialize(() => {
      sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
      loginDB.run(sql, [userData.username, userData.password], (err) => {
        if (err) return console.error(err.message);
        socket.emit('redirect', { username: userData.username, password: userData.password, url: "http://192.168.1.35:3000/" });
      });
    });
  });

  socket.on("message admin?", (data) => {
    loginDB.serialize(() => {
      sql = "SELECT * FROM users WHERE username = ? AND admin = 'true'";
      loginDB.get(sql, [data.username_db], (err, row) => {
        if (err) return console.error(err.message);
        data.check = row ? "admin" : "user";
        data.message = `${data.username} >>> ${data.message}`;
        messageCount++;
        socket.emit("display message checked", data);
      });
    });
  });

  socket.on("getUserData", (username) => {
    loginDB.serialize(() => {
      sql = "SELECT password, admin, cond FROM users WHERE username = ?";
      loginDB.get(sql, [username], (err, row) => {
        if (err) return console.error(err.message);
        if (row) {
          socket.emit("fill edit form", row);
          socket.emit("sendData", row);
        }
      });
    });
  });

  socket.on("edit profil", (data) => {
    loginDB.serialize(() => {
      sql = "UPDATE users SET username = ?, password = ? WHERE username = ?";
      loginDB.run(sql, [data.username, data.password, data.old_username], (err) => {
        if (err) return console.error(err.message);
        socket.emit("profil edited", data);
      });
    });
  });

  socket.on("delete profil", (username) => {
    loginDB.serialize(() => {
      sql = "DELETE FROM users WHERE username = ?";
      loginDB.run(sql, [username], (err) => {
        if (err) return console.error(err.message);
        socket.emit("profil deleted", username);
      });
    });
  });

  socket.on("getDB", () => {
    loginDB.serialize(() => {
      sql = 'SELECT * FROM users';
      loginDB.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);
        socket.emit('recive DB', rows);
      });
    });
  });

  socket.on("getID", (username) => {
    loginDB.serialize(() => {
      sql = 'SELECT id FROM users WHERE username = ?';
      loginDB.get(sql, [username], (err, row) => {
        if (err) return console.error(err.message);
        if (row) socket.emit("receiveID", row.id);
      });
    });
  });

  socket.on("checkUsername", (data) => {
    loginDB.serialize(() => {
      sql = 'SELECT * FROM users WHERE username = ?';
      loginDB.get(sql, [data.username], (err, row) => {
        if (err) return console.error(err.message);
        socket.emit(row ? "UsernameAlreadyTaken" : "signUpOK", data);
      });
    });
  });

  socket.on("conditions acceptées", (data) => {
    loginDB.serialize(() => {
      sql = 'SELECT * FROM users WHERE username = ?';
      loginDB.get(sql, [data.sender_name], (err, row) => {
        if (err) return console.error(err.message);
        if (row) {
          sql = "UPDATE users SET cond = ? WHERE username = ?";
          loginDB.run(sql, ["true", row.username], (err) => {
            if (err) return console.error(err.message);
            io.to(data.id).emit("condition acceptées redirection");
          });
        }
      });
    });
  });
});

function creerListeDepuisObjet(obj) {
  try {
    return Array.isArray(obj) ? obj.map(e => e.innerHTML || '[Object sans propriété nom]') : [];
  } catch (error) {
    console.error('Erreur lors de la création de la liste :', error);
    return [];
  }
}

app.use(express.static(path.join(__dirname, 'public')));

http.listen(port, "0.0.0.0", () => {
  console.log('\n' + chalk.gray('────────────────────────────────────────────────────────────────────────────────────────\n'));
  console.log(chalk.magentaBright(figlet.textSync('Gossip Hoche', { font: 'ANSI Shadow' })));
  console.log('\n' + chalk.bold.green('🚀 Serveur lancé avec succès !\n'));
  console.log(chalk.white('                   📡 Accès local     : ') + chalk.cyanBright(`http://localhost:${port}`));
  console.log(chalk.white('                   🌍 Accès externe   : ') + chalk.cyanBright(`http://88.127.129.62:${port}`));
  console.log('\n' + chalk.gray('────────────────────────────────────────────────────────────────────────────────────────\n'));
});
