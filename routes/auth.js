var express = require('express');
var router = express.Router();
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');


const generateTokens = (user) => {
  const access_token = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1s' }
  );

  const refresh_token = jwt.sign(
    { email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '1d' }
  );

  return {access_token, refresh_token}
}

router.post('/register', async (req, res) => {
  const {email, password} = req.body
  try {
    const [results] = await db.query("SELECT email FROM users")
    console.log(results)
    for (let i = 0; i < results.length; ++i) {
      if (results[i].email === email) {
        return res.status(403).send('Email already taken')
      }
    }
    const hashed = await bcrypt.hash(password, 10)
    db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed])
  } catch (err) {
    console.log(err)
    return res.status(500).send('Database query failed');
  }
  res.send('respond with a resource');
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if (results.length === 0) {
      return res.status(403).send('Invalid email')
    }
    const user = results[0]
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(403).send("Invalid password")
    }
    const {access_token, refresh_token} = generateTokens(user)

    return res.json({access_token, refresh_token})
  } catch (err) {
    console.log(err)
    return res.status(500).send('Database query failed')
  }
})

router.post('/refresh', async (req, res) => {
  const refreshToken = req.body.token
  if (!refreshToken) {
    return res.status(401).send('refresh token required')
  }
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      console.log(err)
      return res.sendStatus(403); // Forbidden
    }
    const {access_token, refresh_token} = generateTokens(user)
    return res.json({access_token, refresh_token})
  });
})

module.exports = router;
