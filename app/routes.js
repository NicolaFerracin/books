var Book = require('./models/book');  // load the book mongoose model
var User = require('./models/user');  // load the User mongoose model for passport.js authentication

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
	app.delete('/api/book/:id/:owner', function(req, res) {
		console.log(req.params.id + req.params.owner)
		Book.remove({
			googleId : req.params.id,
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


	/*
	// get book by id
	app.get('/api/book/:id', function(req, res) {
	// use mongoose to find the book by id requested
	Book.findById(req.params.id, function(err, book) {
	if(err) {
	res.send(err);
}
res.json(book);
});
});

// update a book by id
app.post('/api/books/:id', function(req, res) {
Book.findById(req.body._id, function(err, book) {
if(err) {
res.send(err);
}
// TODO make changes to book
// save
book.save(function (err) {
if (err) {
res.send(err);
}
res.json(book);
});
});
});
*/


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
	var user;
	if (req.isAuthenticated()) {
		var user = JSON.parse(JSON.stringify(req.user));
		// hide sensible information
		delete user.local.password;
	}
	return user;
}
};
