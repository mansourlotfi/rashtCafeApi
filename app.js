const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const placesRoutes = require('./routes/places-route');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const app = express();

app.use(bodyParser.json());
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
	const error = new HttpError('مسیر وارد شده وجود ندارد', 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || 'ارور نامشخص' });
});

mongoose
	.connect('mongodb+srv://mansour:fidelio123@cluster0-bgsnp.mongodb.net/places?retryWrites=true&w=majority')
	.then(() => {
		app.listen(5000);
	})
	.catch((err) => {
		console.log(err);
	});
