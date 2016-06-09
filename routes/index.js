var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var Client = mongoose.model('Client');
var User = mongoose.model('User');

var auth = jwt({ secret: 'SECRET', userProperty: 'payload' });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.param('client_id', function(req, res, next, id) {
	var query = Client.findById(id);

	query.exec(function (err, client) {
		if (err) {
			return next(err);
		}

		if (!client) {
			return next(new Error('can\'t find client'));
		}

		req.client = client;
		return next();
	});
});


router.get('/clients', function(req, res, next) {console.log('get data');
	Client.find(function(err, clients) {
		if (err) {
			return next(err);
		}

		res.json(clients);
	});
});

router.post('/clients', auth, function(req, res, next) {console.log('set data');
	var client = new Client(req.body);
	console.log('User: ' + req.payload.uername);
	client.save(function(err, client) {
		if (err) {
			return next(err);
		}

		res.json(client);
	});
});

router.get('/clients/:client_id', function(req, res) {
	res.json(req.client);
});

router.post('/register', function(req, res, next) {
	if (!req.body.username || !req.body.password) {
		return res.status(400).json({ message: 'Please fill out all fields!' });
	}

	var user = new User();

	user.username = req.body.username;

	user.setPassword(req.body.password);

	user.save(function(err) {
		if (err) {
			return next(err);
		}

		return res.json({ token: user.generateJWT() });
	});
});

router.post('/login', function(req, res, next) {
	if (!req.body.username || !req.body.password) {
		return res.status(400).json({ message: 'Please fill out all fields!' });
	}

	passport.authenticate('local', function(err, user, info) {
		if (err) {
			return next(err);
		}

		if (user) {
			return res.json({ token: user.generateJWT() });
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

module.exports = router;
