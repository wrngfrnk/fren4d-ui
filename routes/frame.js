var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/load/:anim', function(req, res, next) {
    var file = JSON.parse(fs.readFileSync('animations/' + req.params.anim + '.json')); // Is synchronised file reading safe? Needs some testing.
    res.setHeader('Content-Type', 'application/json');
    res.send(file);
});

router.post('/save/:anim', function(req, res) {
    fs.writeFile('animations/' + req.params.anim + '.json', JSON.stringify({'animation': req.body}), () => res.send('saved'));
});

module.exports = router;
