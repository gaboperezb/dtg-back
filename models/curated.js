var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CuratedSchema = new Schema({

    title: {type: String, trim: true, required: true},
    source: {type: String, trim: true, required: true},
    link: {type: String, trim: true, required: true},
    league: {type: String, trim: true, required: true},
    image: {type: String, trim: true, required: true},
    featured: {type: Boolean, default: false}
    
});

CuratedSchema.pre('save', function(next) {
    this.date = this._id.getTimestamp();
    next();
})

var Curated = mongoose.model('Curated', CuratedSchema);
module.exports = Curated;