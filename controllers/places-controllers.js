const HttpError = require('../models/http-error');
const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');

//getplacesbycategory
const getPlacesByCategory = async (req, res, next) => {
	const cId = req.params.cid;

	let places;
	try {
		places = await Place.find({ category: cId });
	} catch (err) {
		const error = new HttpError('مشکل در دریافت اطلاعات', 500);
		return next(error);
	}
	if (!places || places.length === 0) {
		return next(new HttpError('مکانی برای یوزر آیدی ارائه شده یافت نشد', 404));
	}
	res.json({ places: places.map((place) => place.toObject({ getters: true })) });
};

//getPlaceById

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
		const error = new HttpError('مکانی برای آیدی ارائه شده یافت نشد', 404);
		return next(error);
	}
	res.json({ place: place.toObject({ getters: true }) }); //with getters we get ride of underscore of Id _id => id
};

//getPlacesByUserId

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

//edithed creat place
const createPlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError('اطلاعات وارد شده مناسب نمی باشد', 422));
	}
	const { title, description, address, category, creator } = req.body;

	const createdPlace = new Place({
		title,
		description,
		image: 'https://www.docker.host/wp-content/uploads/2019/12/docker_transport.png',
		address,
		category,
		creator
	});

	let user;
	try {
		user = await User.findById(creator);
	} catch (err) {
		const error = new HttpError('ریلیشن بین مکان ثبتی و کاربر وجود ندارد', 500);
		return next(error);
	}
	if (!user) {
		const error = new HttpError('یوزر  در پایگاه داده وجود ندارد', 404);
		return next(error);
	}
	try {
		await createdPlace.save();
		user.places.push(createdPlace);
		await user.save();
	} catch (err) {
		const error = new HttpError('مشکل در ایجاد مکان مورد نظر', 500);
		return next(error);
	}
	res.status(201).json({ place: createdPlace });
};

//createPlace

// const createPlace = async (req, res, next) => {
// 	const errors = validationResult(req);
// 	if (!errors.isEmpty()) {
// 		return next(new HttpError('اطلاعات وارد شده مناسب نمی باشد', 422));
// 	}
// 	const { title, description, address, creator } = req.body;

// 	const createdPlace = new Place({
// 		title,
// 		description,
// 		image: 'https://www.docker.host/wp-content/uploads/2019/12/docker_transport.png',
// 		address,
// 		creator
// 	});

// 	let user;
// 	try {
// 		user = await User.findById(creator);
// 	} catch (err) {
// 		const error = new HttpError('ریلیشن بین مکان ثبتی و کاربر وجود ندارد', 500);
// 		return next(error);
// 	}
// 	if (!user) {
// 		const error = new HttpError('یوزر  در پایگاه داده وجود ندارد', 404);
// 		return next(error);
// 	}

// 	try {
// 		const sess = await mongoose.startSession();
// 		sess.startTransaction();
// 		await createdPlace.save({ session: sess });
// 		user.places.push(createdPlace);
// 		await user.save({ session: sess });
// 		await sess.commitTransaction();
// 	} catch (err) {
// 		const error = new HttpError('مشکل در ایجاد مکان مورد نظر', 500);
// 		return next(error);
// 	}
// 	res.status(201).json({ place: createdPlace });
// };

//updatePlace

const updatePlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError('اطلاعات وارد شده صحیح نمی باشد', 422));
	}

	const { title, description } = req.body;
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError('مشکل در ارتباط با سرور', 500);
		return next(error);
	}

	place.title = title;
	place.description = description;

	try {
		await place.save();
	} catch (err) {
		const error = new HttpError('مشکل در ارتباط با سرور برای ذخیره داده', 500);
		return next(error);
	}

	res.status(200).json({ place: place.toObject({ getters: true }) });
};

//deletePlace

const deletePlace = async (req, res, next) => {
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId).populate('creator');
	} catch (err) {
		const error = new HttpError('Something went wrong.', 500);
		return next(error);
	}

	if (!place) {
		const error = new HttpError('مکان مورد نظر وجود ندارد', 404);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await place.remove({ session: sess });
		place.creator.places.pull(place);
		await place.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError('Something went wrong.', 500);
		return next(error);
	}

	res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlacesByCategory = getPlacesByCategory;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
