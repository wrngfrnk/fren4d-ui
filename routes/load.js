var express = require('express');
var router = express.Router();

/* Test */
router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        animation: {
            frames: [
                {
                    frameData: [0 ,0, 0, 255, 0, 0, 0, 0],
                    frameTime: 1000,
                }
            ],
            mood: ["neutral", "idle"]
        }
    }));
});

module.exports = router;
