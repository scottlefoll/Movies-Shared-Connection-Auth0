const routes = require('express').Router();
const {param, query, validationResult} = require('express-validator');
const moviesController = require('../controllers/movies-controller');
const { requiresAuth, checkScopes} = require('../middleware/auth');
const { validateMovieFields, validateMovieParamId } = require('../validators/movieValidator');
const curr_year = new Date().getFullYear();

// Add the root route
routes.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

routes.get('/customLogout', (req, res) => {
    console.log('in /customLogout');
    // const returnTo = encodeURIComponent('https://cse341-spring23-w08-movies-shared.onrender.com');
    res.clearCookie('appSession');  // Replace 'cookie_name' with the name of your session cookie
    res.clearCookie('auth0.is.authenticated');  // Replace 'cookie_name' with the name of your session cookie
    res.clearCookie('ai_user');  // Replace 'cookie_name' with the name of your session cookie
    res.clearCookie('auth0');  // Replace 'cookie_name' with the name of your session cookie
    res.clearCookie('auth0_compat');  // Replace 'cookie_name' with the name of your session cookie
    res.clearCookie('auth0-mf_compat');  // Replace 'cookie_name' with the name of your session cookie
    res.clearCookie('appSession');  // Replace 'cookie_name' with the name of your session cookie
    // res.redirect(`https://dev-4f411zuqwxmob8zg.us.auth0.com/v2/logout?client_id=VKMpv9LYKZ9Re3WzK7kisYvTb0wElkZq&returnTo=${returnTo}`);
});

// Add the profile route
routes.get('/profile', requiresAuth(), (req, res) => {
    console.log('in /profile');
    res.send(JSON.stringify(req.oidc.user));
});

routes.get('/db',  async (req, res, next) => {
    console.log('in /db');
    try {
      const collection = await moviesController.getDBList();
      res.send(collection);
    } catch (err) {
      next(err);
    }
  });


routes.get('/movies', async (req, res, next) => {
    console.log(req, 'in /movies route');
    try {
      const collection = await moviesController.getMovies();
      res.send(collection);
    } catch (err) {
      next(err);
    }
});

// Route with movie ID validation
routes.get('/movies/:id', validateMovieParamId, async (req, res, next) => {
    console.log(req, 'in /movies/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
        const collection = await moviesController.getMovieById(req, res, req.params.id);
        res.send(collection);
    } catch (err) {
        next(err);
    }
});

// routes.get('/title/:Title', param('Title').notEmpty().isAlphanumeric().isLength({ max: 50 }), async (req, res, next) => {
routes.get('/title/:Title', [
    param('Title')
        .notEmpty()
        .withMessage('Title is required')
        .isAlphanumeric()
        .withMessage('Title is case insensitive, and must contain only alphanumeric characters')
        .isLength({ min: 2, max: 50 })
        .withMessage('Title must be at least 2 characters and not exceed 50 characters')
    ], async (req, res, next) => {
    console.log(req, 'in /movies/:title route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
      const collection = await moviesController.getMovieByTitle(req, res, req.params.Title);
      res.send(collection);
    } catch (err) {
      next(err);
    }
  });

// routes.get('/partial/:Title', param('Title').notEmpty().isAlphanumeric().isLength({ max: 50 }), async (req, res, next) => {
routes.get('/partial/:Title', [
    param('Title')
        .notEmpty()
        .withMessage('Partial title is required')
        .isAlphanumeric()
        .withMessage('Partial title is case insensitive, and must contain only alphanumeric characters')
        .isLength({ min: 2, max: 50 })
        .withMessage('Partial title must be at least 2 characters and not exceed 50 characters')
    ], async (req, res, next) => {
  console.log(req, 'in /movies/partial/:title route');
  const result = validationResult(req);
  if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
  }
  try {
    const collection = await moviesController.getMoviesByPartialTitle(req, res, req.params.Title);
    res.send(collection);
  } catch (err) {
    next(err);
  }
});


routes.get('/director/:name', [
    param('name')
        .matches(/^[A-Za-z]{2,}$/)
        .withMessage('Director name is case insensitive and may be partial, and must contain only alphabetic characters and have a minimum length of 2')
        .notEmpty()
        .withMessage('Director name is required')
    ], async (req, res, next) => {
            console.log(req, 'in /movies/director/:name route');
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }
            try {
                const collection = await moviesController.getMoviesByDirector(req, res, req.params.name);
                res.send(collection);
            } catch (err) {
                next(err);
            }
    });

routes.post('/create',  requiresAuth(), validateMovieFields, async (req, res, next) => {
        console.log(req, 'in /movies/create route');
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        try {
            await moviesController.createMovie(req, res);
        } catch (err) {
            next(err);
        }
    });

// routes.put('/update/:id', param('id').notEmpty().matches(/^[A-Za-z0-9]+_[A-Za-z0-9]{4}$/), async (req, res, next) => {
routes.put('/update/:id',  requiresAuth(), validateMovieParamId, validateMovieFields, async (req, res, next) => {
    console.log(req, 'in /movies/update/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
      await moviesController.updateMovie(req, res, req.params.id);
    } catch (err) {
      next(err);
    }
  });


// routes.delete('/delete/:id', param('id').notEmpty().matches(/^[A-Za-z0-9]+_[A-Za-z0-9]{4}$/), async (req, res, next) => {
routes.delete('/delete/:id', requiresAuth(), validateMovieParamId,  async (req, res, next) => {
    // checkScopes(["delete:records"]),
    console.log(req, 'in /movies/delete/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
        await moviesController.deleteMovie(req, res, req.params.id);
    } catch (err) {
        next(err);
    }
    });

module.exports = routes;
