var express = require('express');
var router = express.Router();
const db = require('../db')
const bcrypt = require('bcryptjs')

router.post('/register', async function(req, res, next) {
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

module.exports = router;
