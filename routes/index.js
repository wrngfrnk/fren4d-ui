var express = require('express');
var router = express.Router();

/* Test */
router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ a: 1 }));
});

module.exports = router;
