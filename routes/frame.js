var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/load/:anim', function(req, res, next) {
    function getFileWithExt() {
        let ext = req.params.anim.indexOf('.json') > -1 ? '' : '.json';
        return req.params.anim + ext;
    } 

    var file = JSON.parse(fs.readFileSync('animations/' + getFileWithExt())); // Is synchronised file reading safe? Needs some testing.
    res.setHeader('Content-Type', 'application/json');
    res.send(file);
});

router.get('/list', function(req, res, next) {
    var list = {
        files: []
    };

    fs.readdirSync('animations/').forEach(file => {
        list.files.push(file);
    });

    res.setHeader('Content-Type', 'application/json');
    console.log(list)
    res.send(JSON.stringify({...list, status: 'yep'}));
});

router.post('/save/:anim', function(req, res) {
    fs.writeFile('animations/' + req.params.anim + '.json', JSON.stringify({'animation': req.body}), () => res.send('saved'));
});

module.exports = router;
