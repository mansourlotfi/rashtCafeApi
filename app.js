const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-route');
const HttpError = require('./models/http-error');
const app = express();

app.use(bodyParser.json());
app.use('/api/places', placesRoutes);

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
app.listen(5000);
