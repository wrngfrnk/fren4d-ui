var express = require('express');
var router = express.Router();

/* Test */
router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    // Do something maybe
});

module.exports = router;
