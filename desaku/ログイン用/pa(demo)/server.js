const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;

// MySQLの接続設定
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // 適切なパスワードを設定してください
    database: 'login_system'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

// ミドルウェアの設定
app.use(cors());
app.use(bodyParser.json());

// 登録ルート
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
            return res.status(400).send('Error registering user');
        }
        res.status(201).send('User registered');
    });
});

// ログインルート
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).send('Error on the server.');
        }
        if (results.length === 0) {
            return res.status(401).send('No user found.');
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        
        if (!passwordIsValid) {
            return res.status(401).send('Invalid password.');
        }

        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: 86400 }); // 24 hours
        res.status(200).send({ auth: true, token: token });
    });
});

// サーバーの起動
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;

// MySQLの接続設定
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // 適切なパスワードを設定してください
    database: 'login_system'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});
