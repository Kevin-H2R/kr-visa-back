var express = require('express');
var router = express.Router();
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');


const generateTokens = (user) => {
  const access_token = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
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
  console.log("email: ", email)
  console.log("password: ", password)
  try {
    const [results] = await db.query("SELECT email FROM user")
    console.log(results)
    for (let i = 0; i < results.length; ++i) {
      if (results[i].email === email) {
        return res.status(403).json({success: false, message: 'Email already taken'} )
      }
    }
    const hashed = await bcrypt.hash(password, 10)
    db.query('INSERT INTO user (email, password) VALUES (?, ?)', [email, hashed])
  } catch (err) {
    console.log(err)
    return res.status(500).send('Database query failed');
  }
  res.json({success: true});
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [results] = await db.query('SELECT * FROM user WHERE email = ?', [email])
    if (results.length === 0) {
      return res.status(403).json({success: false, message: 'Invalid email'})
    }
    const user = results[0]
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(403).json({success: false, message: 'Invalid password'})
    }
    const {access_token, refresh_token} = generateTokens(user)

    return res.json({access_token, refresh_token})
  } catch (err) {
    console.log(err)
    return res.status(500).json({success: false, message: 'Database query failed'})
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
