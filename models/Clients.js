var mongoose = require('mongoose');

var ClientSchema = new mongoose.Schema({
	name: String,
	email: String,
	phone: String,
	address: String
});

mongoose.model('Client', ClientSchema);
