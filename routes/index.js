var express = require('express');
var router = express.Router();

/* Test */
router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send({alive: "Hell yes brother"})
});

module.exports = router;
