var express = require('express');
var router = express.Router();
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const crypto = require("crypto");


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
    const uuid = crypto.randomUUID();
    const expiration = new Date()
    expiration.setHours(expiration.getHours() + 1)
    await db.query(
      'INSERT INTO user (email, password, verification_token, verification_expiration, status) VALUES (?, ?, ?, ?, ?)',
      [email, hashed, uuid, expiration, 'UNVERIFIED']
    )
    // TODO: send verification token
  } catch (err) {
    console.log(err)
    return res.status(500).send('Database query failed');
  }
  res.json({success: true});
})

router.get('/verify', async (req, res) => {
  const token = req.query.token
  if (!token) {
    return res.status(403).json({success: false, message: 'Token missing'})
  }
  const [results] = await db.query('SELECT * FROM user WHERE verification_token = ?', [token])
  if (results.length !== 1) {
    return res.status(403).json({success: false, message: 'Invalid token'})
  }
  const user = results[0]
  if (user.verification_expiration < new Date()) {
    return res.status(403).json({sucess: false, message: 'Expired token'})
  }
  await db.query('UPDATE user SET status = "ACTIVE", verification_token = NULL, verification_expiration = NULL WHERE verification_token = ?', [token])
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
    if (user.status === "UNVERIFIED") {
      return res.status(403).json({success: false, message: 'User is not verified'})
    }
    if (user.status !== "ACTIVE") {
      return res.status(403).json({success: false, message: 'User is not active'})
    }
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
