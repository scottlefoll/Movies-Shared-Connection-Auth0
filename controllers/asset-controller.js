const { asset,  } = require('../models/asset');
// genre and director models are imported in the movie model


// GET /assets
async function getAssets(req, res) {
    console.log('getAssets called');
    try {
      const result = await Asset.find({});
      if (result.length === 0) {
        throw { statusCode: 404, message: 'No assets found' };
      }
      return result;
    } catch (err) {
      console.error(err);
      if (err.statusCode !== 404) {
        res.status(500).json({ message: 'Internal server error' });
      }
      throw err;
    }
  }


// GET /assets/:assetId  ('AS-004')
async function getAssetById(req, res, id) {
    console.log('getAssetById called');
    console.log('searching for id:', id);
    try {
      const result = await Movie.findOne({ _id: id });
      if (!result || result.length === 0) {
        res.status(404).json({ message: 'No asset found for id: ' + id });
      }
      return result;
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
      throw err;
    }
}

async function getAssetByAssetId(req, res, id) {
    console.log('getAssetById called');
    console.log('searching for id:', id);
    try {
      const result = await Movie.findOne({ id: id });
      if (!result || result.length === 0) {
        res.status(404).json({ message: 'No asset found for Asset id: ' + id });
      }
      return result;
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
      throw err;
    }
}

// GET /serialNumber/:serialNumber (ie. 'ASDFKE-783')
async function getAssetByBrand(req, res, brand) {
    console.log('getAssetByBrand called');
    console.log('brand:', brand);
    try {
      const result = await Brand.find({ brand: brand });
      if (!result || result.length === 0) {
        res.status(404).send('No asset found matching brand: ' + brand);
      }
      return result;
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Internal server error' });
      throw err;
    }
  }


async function createAsset(req, res) {
    console.log('createAsset called');
    console.log('req.body:', req.body);
    console.log('req.body.AssetId:', req.body[0].AssetId);
    console.log('req.body.serialNumber:', req.body[0].serialNumber);

    try {
      let assetId = req.body[0].AssetId;
      let serialNumber = req.body[0].serialNumber;
      let brand = req.body[0].brand;
      let purchaseDate = req.body[0].purchaseDate;
      let model = req.body[0].model;
      let modelNum = req.body[0].modelNum;
      let purchasePrice = req.body[0].purchasePrice;
      let image = req.body[0].image;
      let physicalDescription = req.body[0].physicalDescription;
      let status = req.body[0].status;
      let condition = req.body[0].condition;
      let building = req.body[0].building;
      let user = req.body[0].user;

      const newMovie = new Movie({
        _id: _id2,
        Title,
        Year,
        Rated,
        Released,
        Runtime,
        Genre,
        Director,
        Writer,
        Actors,
        Plot,
        Language,
        Country,
        Awards,
        Poster,
        Metascore,
        imdbRating,
        imdbVotes,
        imdbID,
        Type,
      });

      console.log('newMovie:', newMovie);
      // Save the movie object to the database
      const createdMovie = await newMovie.save();

      return res.status(201).json({
        statusCode: 201,
        message: 'Movie created successfully',
        createdMovieId: createdMovie._id.toString(),
      });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Duplicate key violation. Movie creation failed',
          id: req.body._id,
          keyValue: err.keyValue,
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: 'Movie creation failed',
          id: req.body._id,
        });
      }
    }
  }


// PUT /update/:id
async function updateMovie(req, res, id) {
    // if the firstName or lastName fields are updated, then the _id should be updated.
    // in order to update the _id, I need to delete the existing contact and create a new one,
    // since _id is immutable (Should I actually do this?)

    console.log('updateMovie called');
    try {
      const movieId = req.params.id;
      console.log('movieId:', movieId);

      // Dynamically build the update object based on the fields present in the request body
      const updateFields = req.body[0];
      delete updateFields['_id'];

      console.log('updateFields:', updateFields);

      // Start a session for the atomic transaction
      const session = await Movie.startSession();
      // Use a transaction to ensure atomicity
      session.startTransaction();

      try {
        // Find the movie with the specified ID and update it with the update object
        const result = await Movie.findOneAndUpdate({ _id: movieId }, updateFields, { new: true });
        console.log('result:', result);

        if (result) {
            // Check if the update contained the Title and/or Year fields, and if so, update the _id
            if (updateFields.Title || updateFields.Year) {
                await changeMovieId(movieId, res);
            }

            // Commit the transaction
            await session.commitTransaction();
            res.status(200).send({ message: `Movie ${movieId} updated successfully`, updatedMovie: result });
        } else {
            await session.abortTransaction();
            res.status(404).send({ message: `Movie ${movieId} not found` });
        }
      } catch (err) {
            console.error(err);
            throw err;
            res.status(500).send({ message: `Movie ${movieId} update failed` });
      } finally {
            session.endSession();
      }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Movie ${movieId} update failed` });
    }
  }

    //  This function is for the internal use of the updateContact() function
    //  It creates a new _id if the firstName or lastName fields are changed
  async function changeMovieId(_id, res) {
    console.log('changeMovieId called');
    try {
        // Find the old movie record by the _id parameter
        const oldMovie = await Movie.findOne({ _id });
        console.log('oldMovie:', oldMovie);

        // Generate a new _id based on the Title and Year fields
        const newMovieId = `${oldMovie.Title.toLowerCase().replace(/\s/g, '')}_${oldMovie.Year}`;
        console.log('newMovieId:', newMovieId);
        // Check if the new _id is the same as the old one or already exists
        if (newMovieId === _id || (await Movie.findOne({ _id: newMovieId }))) {
            return;
        }
        // create a new movie object with the updated _id based on the Title and Year fields
        const newMovie = {
                _id: oldMovie.Title.toLowerCase().replace(' ', '') + '_' + oldMovie.Year,
                Title: oldMovie.Title,
                Year: oldMovie.Year,
                Rated: oldMovie.Rated,
                Released: oldMovie.Released,
                Runtime: oldMovie.Runtime,
                Genre: oldMovie.Genre,
                Director: oldMovie.Director,
                Writer: oldMovie.Writer,
                Actors: oldMovie.Actors,
                Plot: oldMovie.Plot,
                Language: oldMovie.Language,
                Country: oldMovie.Country,
                Awards: oldMovie.Awards,
                Poster: oldMovie.Poster,
                Metascore: oldMovie.Metascore,
                imdbRating: oldMovie.imdbRating,
                imdbVotes: oldMovie.imdbVotes,
                imdbID: oldMovie.imdbID,
                Type: oldMovie.Type,
            };

            console.log('newMovie:', newMovie);
            // Create a new instance of the Movie model
            const newMovieInstance = new Movie(newMovie);
            // Save the new movie instance to the database
            const createdMovie = await newMovieInstance.save();

            console.log('createdMovie:', createdMovie);

            if (createdMovie) {
                // Delete the old movie record
                await Movie.deleteOne({ _id });
                console.log('Movie deleted successfully after update - old movie id: ' + _id);
                return createdMovie;
            }
    } catch (err) {
            console.error(err);
            if (err.code === 11000) {
                return res.status(400).json({
                    statusCode: 400,
                    message: 'Record creation failed. Duplicate key detected.',
                });
            } else {
                return res.status(500).json({
                    statusCode: 500,
                    message: 'Record creation failed. An internal server error occurred.',
            });
        }
    }
}

// DELETE /delete/:id
async function deleteMovie(req, res, id) {
    console.log('deleteMovie called');
    try {
      const movieId = id;
      const result = await Movie.deleteOne({ _id: movieId });
      if (result.deletedCount > 0) {
        return res.send({ message: `Movie ${movieId} deleted successfully` });
      } else {
        return res.status(404).send({ message: `Movie ${movieId} not found` });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Internal server error' });
      throw err;
    }
  }


  module.exports = {
    getDBList,
    getMovies,
    getMovieById,
    getMovieByTitle,
    getMoviesByPartialTitle,
    getMoviesByDirector,
    createMovie,
    updateMovie,
    deleteMovie,
  };

  console.log('movies-controller.js is loaded!');

