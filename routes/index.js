var express = require('express');
var router = express.Router();

router.use('/api', require('../api'));

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: "Library"});
});

module.exports = router;
