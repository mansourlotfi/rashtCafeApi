const HttpError = require('../models/http-error');
const uuid = require('uuid/v4');

const DUMMY_PLACES = [
	{
		id: 'p1',
		title: 'cafe keik',
		description: 'a very beatifull place',
		address: 'mantariye',
		creator: 'u1'
	}
];
1;

const getPlaceById = (req, res, next) => {
	const placeId = req.params.pid;
	const place = DUMMY_PLACES.find((p) => {
		return p.id === placeId;
	});

	if (!place) {
		throw new HttpError('مکانی برای آیدی ارائه شده یافت نشد', 404);
	}
	res.json({ place });
};

const getPlaceByUserId = (req, res, next) => {
	const userId = req.params.uid;
	const place = DUMMY_PLACES.find((p) => {
		return p.creator === userId;
	});
	if (!place) {
		return next(new HttpError('مکانی برای یوزر آیدی ارائه شده یافت نشد', 404));
	}
	res.json({ place });
};

const createPlace = (req, res, next) => {
	const { title, description, address, creator } = req.body;
	const createdPlace = {
		id: uuid(),
		title,
		description,
		address,
		creator
	};
	DUMMY_PLACES.unshift(createdPlace);
	res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
	const { title, description, address } = req.body;
	const placeId = req.body.pid;
	const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
	const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
	updatedPlace.title = title;
	updatedPlace.description = description;
	updatePlace.address = address;
	DUMMY_PLACES[placeIndex] = updatedPlace;

	res.status(200).json({ place: updatedPlace });
};
const deletePlace = (req, res, next) => {};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
