var express = require('express');
var router = express.Router();
const authenticateToken = require('../middleware/authenticate')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({'message': 'YOYOYO'});
});

router.get('/protected', authenticateToken, (req, res) => {
  return res.json({user: req.user})
})

module.exports = router;
