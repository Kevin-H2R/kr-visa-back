var express = require('express');
var router = express.Router();
const authenticateToken = require('../middleware/authenticate')
const db = require('../db')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/visa', authenticateToken, async (req, res, next) => {
  const [users] = await db.query("SELECT id FROM user where email = ?", req.user.email)
  // TODO handle no result
  const id = users[0].id
  const [visas] = await db.query("SELECT visa.*, user_visa.expiration_date FROM visa INNER JOIN user_visa on visa.id = user_visa.visa_id WHERE user_id = ?", [id])
  res.json({success: true, visa: visas[0]})
})

module.exports = router;
