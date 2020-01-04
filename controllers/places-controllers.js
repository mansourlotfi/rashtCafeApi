const HttpError = require('../models/http-error');
const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const Place = require('../models/place');

let DUMMY_PLACES = [
	{
		id: 'p1',
		title: 'cafe keik',
		description: 'a very beatifull place',
		address: 'mantariye',
		creator: 'u1'
	}
];
1;

const getPlaceById = async (req, res, next) => {
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError('مشکل در پیدا کردن مکان مورد نظر', 500);
		return next(error);
	}

	if (!place) {
		throw new HttpError('مکانی برای آیدی ارائه شده یافت نشد', 404);
	}
	res.json({ place: place.toObject({ getters: true }) }); //with getters we get ride of underscore of Id _id => id
};

const getPlacesByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	let places;
	try {
		places = await Place.find({ creator: userId });
	} catch (err) {
		const error = new HttpError('مشکل در دریافت اطلاعات', 500);
		return next(error);
	}
	if (!places || places.length === 0) {
		return next(new HttpError('مکانی برای یوزر آیدی ارائه شده یافت نشد', 404));
	}
	res.json({ places: places.map((place) => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError('اطلاعات وارد شده مناسب نمی باشد', 422);
	}
	const { title, description, address, creator } = req.body;
	const createdPlace = new Place({
		title,
		description,
		image: 'https://www.docker.host/wp-content/uploads/2019/12/docker_transport.png',
		address,
		creator
	});
	try {
		await createdPlace.save();
	} catch (err) {
		const error = new HttpError('مشکل در ایجاد مکان مورد نظر', 500);
		return next(error);
	}
	res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
	const { title, description, address } = req.body;
	const placeId = req.body.pid;

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError('مشکل در بروزرسانی محل مورد نظر', 500);
		return next(error);
	}

	updatedPlace.title = title;
	updatedPlace.description = description;
	updatePlace.address = address;
	try {
		await place.save();
	} catch (err) {
		const error = new HttpError('مشکل در ذخیر اطلاعات در سرور', 500);
		return next(error);
	}

	res.status(200).json({ place: place.toObject({ getters: true }) });
};
const deletePlace = (req, res, next) => {
	const placeId = req.body.pid;
	DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id != placeId);
	res.status(200).json({ message: 'مکان مورد نظر حذف شد' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
