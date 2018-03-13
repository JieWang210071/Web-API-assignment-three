// grab the packages we need
const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const passwordHash = require('password-hash');
const jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
const config = require('./config'); // get our config file
const User   = require('./app/models/user'); // get our user mongoose model
const Movie   = require('./app/models/movie'); // get our mongoose model
const morgan = require('morgan');
const app = express();


// const dotenv = require('dotenv');

// =======================
// configuration =========
// =======================
const port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

// Config body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route

app.post('/signup', (req, res) => {

    // create a sample user
    const newUser = new User({ 
      username: req.body.username, 
      password: passwordHash.generate(req.body.password),
      name: req.body.name 
    });

    User.findOne({
		username: req.body.username
	}, (err, user) => {
        if (err) throw err;
        if (!user) {
            // save the sample user
            newUser.save((err) => {
                if (err) {
                    res.json({ error: err.errors.name.message });
                } else {
                    console.log('User saved successfully');
                    res.json({ success: true });
                }
            });
        } else {
            res.json({error: 'user already exists'});
        }
    });
});

const apiRoutes = express.Router(); 

apiRoutes.post('/signin', (req, res) => {

	// find the user
	User.findOne({
		username: req.body.username
	}, (err, user) => {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {

			// check if password matches
			if (!passwordHash.verify(req.body.password, user.password)) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {

				// if user is found and password is right
				// create a token
				const payload = {
					name: user.name,
					username: user.username
				}
				const token = jwt.sign(payload, app.get('superSecret'), {
					expiresIn: 86400 // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}		

		}

	});
});


// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use((req, res, next) => {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), (err, decoded) => {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;	
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
		
	}
	
});

apiRoutes.get('/users', (req, res) => {
	User.find({}, (err, users) => {
		res.json(users);
	});
});

//save movie
apiRoutes.post('/savemovie', (req, res, next) => {

    // create a sample movie
    const newMovie = new Movie({ 
      title: req.body.title, 
      year: req.body.year,
      genre: req.body.genre,
      actors: req.body.actors 
    });

    newMovie.save((err) => {
        if (err) {
            // res.json({ error: err });
            // throw err;
            res.json({ error: err.message });
            return next(err);
        } else {
            res.json({ message: 'Movie saved successfully' });
        }
    });
});

//delete movie
apiRoutes.delete('/deletemovie', (req, res, next) => {

    // find the movie
    Movie.findOneAndRemove({
		title: req.body.title
	}, (err, movie) => {
		if (err) throw err;

		if (!movie) {
			res.json({ success: false, message: 'delete movie failed. Movie not found.' });
		} else if (movie) {
			res.json({ success: true, message: 'Movie deleted successfully!' });

		}
	});
});

//get movie
apiRoutes.get('/getmovie', (req, res) => {

    // find the movie
    Movie.findOne({
		title: req.query.title
	}, (err, movie) => {
		if (err) throw err;

		if (!movie) {
			res.json({ success: false, message: 'Movie not found.' });
		} else {
			res.json(movie);
		}
	});
});

//get all movie
apiRoutes.get('/getallmovie', (req, res) => {

    // find the movie
    Movie.find({}, (err, movies) => {
		if (err) throw err;
		res.json(movies);
	});
});

//update movie
apiRoutes.put('/updatemovie', (req, res) => {

    // find and update the movie
    Movie.findOneAndUpdate({
		title: req.query.title
	}, req.body, (err, movie) => {
		if (err) throw err;

		if (!movie) {
			res.json({ success: false, message: 'Movie not found.' });
		} else {
			res.json(movie);
		}
	});
});

app.use('/api', apiRoutes);
// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);