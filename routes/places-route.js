const express = require('express');

const router = express.Router();

const DUMMY_PLACES = [
	{
		id: 'p1',
		title: 'cafe keik',
		description: 'a very beatifull place',
		address: 'mantariye',
		creator: 'u1'
	}
];
router.get('/:pid', (req, res, next) => {
	const placeId = req.params.pid;
	const place = DUMMY_PLACES.find((p) => {
		return p.id === placeId;
	});
	res.json({ place });
});

router.get('/user/:uid', (req, res, next) => {
	const userId = req.params.uid;
	const place = DUMMY_PLACES.find((p) => {
		return p.creator === userId;
	});
	res.json({ place });
});
module.exports = router;
