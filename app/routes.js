var Book = require('./models/book');  // load the Book mongoose model
var User = require('./models/user');  // load the User mongoose model for passport.js authentication
var Trade = require('./models/trade');  // load the Trade mongoose model

module.exports = function(app, passport) {
	// api ---------------------------------------------------------------------
	// create book
	app.post('/api/book', function(req, res) {
		var book = new Book(req.body);
		book.save(function (err) {
			if (err) {
				res.send(err);
			} else {
				res.sendStatus(200);
			}
		})
	});

	// get all books
	app.get('/api/books', function(req, res) {
		// use mongoose to get all books from the db
		Book.find(function(err, books) {
			// if err, send it
			if (err) {
				res.send(err);
			}
			res.json(books);
		});
	});

	// delete a book by googleId AND owner, since there might be more copies of the same book, but only one per owner
	app.delete('/api/book/:googleId/:id/:owner', function(req, res) {
		// first delete all the trades about this book
		// use mongoose to get all the trades by parameter
		Trade.remove({
			'book._id' : req.params.id
		}, function(err, trade) {
			if (err) {
				res.send(err);
			} else {
				res.send();
			}
		});
		// now remove book
		Book.remove({
			googleId : req.params.googleId,
			owner : req.params.owner
		}, function(err, book) {
			if (err) {
				res.send(err);
			} else {
				res.send();
			}
		});
	});

	// get books by owner
	app.get('/api/books/:owner', function(req, res) {
		// use mongoose to get all the books using a paramater
		// Populate the search obj with the needed parameter
		Book.find({ owner : req.params.owner}, function(err, books) {
			// if err, send it
			if (err) {
				res.send(err);
			} else if (!books) {
				res.send("No books found");
			} else {
				res.json(books);
			}
		});
	});

	// create trade
	app.post('/api/trade', function(req, res) {
		// make sure a trade with same trade.book._id and trade.requestedBy doesn't exist
		Trade.findOne({ 'book._id' :  req.body.book._id, 'requestedBy' : req.body.requestedBy }, function(err, trade) {
			if (err) {
				res.send(err);
			} else if (trade) {
				res.status(500).send("Uh oh, it looks like you already made a trade request for this book.");
			} else {
				var trade = new Trade(req.body);
				trade.save(function (err) {
					if (err) {
						res.send(err);
					} else {
						res.sendStatus(200);
					}
				});
			}
		});
	});

	// get all trades
	app.get('/api/trades', function(req, res) {
		// use mongoose to get all trades from the db
		Trade.find(function(err, trades) {
			// if err, send it
			if (err) {
				res.send(err);
			}
			res.json(trades);
		});
	});

	// get trades by parameter
	app.get('/api/trades/:parameter', function(req, res) {
		// use mongoose to get all the trades by parameter
		Trade.find({ $or : [{ 'requestedBy' : req.params.parameter }, { 'requestedTo' : req.params.parameter }]}, function(err, trades) {
			// if err, send it
			if (err) {
				res.send(err);
			} else if (!trades) {
				res.send("No trades found");
			} else {
				res.json(trades);
			}
		});
	});

	// update a trade status
	app.post('/api/trade/:id', function(req, res) {
		Trade.findOne({ '_id' :  req.params.id }, function(err, trade) {
			if (err) {
				res.send(err);
			} else {
				trade.accepted = true;
				trade.save(function(err) {
					if (err) {
						return next(err)
					} else {
						res.sendStatus(200)
					}
				});
			}
		});
	});

	// delete a trade by requestedBy and book.googleId
	app.delete('/api/trade/:id', function(req, res) {
		Trade.remove({
			_id : req.params.id
		}, function(err, trade) {
			if (err) {
				res.send(err);
			} else {
				res.send();
			}
		});
	});

	// process the login form
	// Express Route with passport authentication and custom callback
	app.post('/api/login', function(req, res, next) {
		passport.authenticate('local-login', function(err, user, info) {
			if (err) {
				return next(err);
			}
			if (user === false) {
				res.status(401).send(req.flash('loginMessage'));
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(500).send("There has been an error");
					} else {
						res.status(200).send("success!");
					}
				});
			}
		})(req, res, next);
	});

	// process the signup form
	// Express Route with passport authentication and custom callback
	app.post('/api/signup', function(req, res, next) {
		passport.authenticate('local-signup', function(err, user, info) {
			if (err) {
				return next(err);
			}
			if (user === false) {
				res.status(401).send(req.flash('signupMessage'));
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(500).send("There has been an error");
					} else {
						res.status(200).send("success!");
					}
				});
			}
		})(req, res, next);
	});

	// check if the user is logged in an retrieve a different user obj based on the status
	app.get('/loggedin', function(req, res) {
		res.json(isLoggedIn(req));
	});

	// log the user out and redirect to /
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// update a user entry when city, state or fullName changes
	app.post('/api/user/:id', function(req, res) {
		User.findOne({ '_id' :  req.params.id }, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				user.fullName = req.body.fullName;
				user.city = req.body.city;
				user.state = req.body.state;
				user.save(function(err) {
					if (err) {
						return next(err)
					} else {
						req.login(user, function(err) {
							if (err) {
								return next(err)
							} else {
								res.sendStatus(200)
							}
						})
					}
				});
			}
		});
	});

	isLoggedIn = function(req) {
		if (req.isAuthenticated()) {
			var user = JSON.parse(JSON.stringify(req.user));
			// hide sensible information
			delete user.local.password;
			return user;
		}
		return null;
	}
};
