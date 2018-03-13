// get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports

const MovieSchema = new Schema({ 
    title: {
        type: String,
        required: [true, 'title must be provided']
    }, 
    year: {
        type: String,
        required: [true, 'year must be provided']
    }, 
    genre: { 
        type: String,
        required: [true, 'genre must be provided'], 
        enum: [
            'Action', 
            'Adventure', 
            'Comedy', 
            'Drama', 
            'Fantasy', 
            'Horror', 
            'Mystery', 
            'Thriller', 
            'Western'
        ] 
    },
    actors: [
        {
            actor: {
                type: String,
                required: [true, 'actors name must be provided']
            },
            character: {
                type: String,
                required: [true, 'character name must be provided']
            }
        }
    ]
});

MovieSchema.path('actors').validate(function minLength (actors) {
    return actors.length >= 3;
}, 'Must provide at least 3 actors');

module.exports = mongoose.model('Movie', MovieSchema);