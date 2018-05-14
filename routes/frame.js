var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/load/:anim', function(req, res, next) {
    var file = JSON.parse(fs.readFileSync('animations/' + req.params.anim + '.json'));
    res.setHeader('Content-Type', 'application/json');
    res.send(file);
});

module.exports = router;
