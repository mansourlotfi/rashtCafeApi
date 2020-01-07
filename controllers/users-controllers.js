const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, '-password');
	} catch (err) {
		const error = new HttpError('مشکل در دریافت اطلاعات', 500);
		return next(error);
	}
	res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError('داده های ورودی صحیح نمی باشد', 422));
	}
	const { name, email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('مشکل در چک کردن ایمیل', 500);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError('ایمیل تکراری', 422);
		return next(error);
	}

	const createdUser = new User({
		name,
		email,
		image: 'https://www.msina.ir/shop/wp-content/themes/easy-market-7/images/avatar.svg',
		password,
		places: []
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError('مشکل در سرور', 500);
		return next(error);
	}

	res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;

	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('مشکل ارتباط با سرور', 500);
		return next(error);
	}

	if (!existingUser || existingUser.password !== password) {
		const error = new HttpError('عدم تطابق اطلاعات', 401);
		return next(error);
	}

	res.json({ message: 'Logged in!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
