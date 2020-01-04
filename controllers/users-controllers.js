const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const DUMMY_USERS = [
	{
		id: 'u1',
		name: 'mansour lotfi',
		email: 'mansour@Test.com',
		password: 'testers'
	}
];
const getUsers = (req, res, next) => {
	res.json({ users: DUMMY_USERS });
};
const signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError('اطلاعات وارد شده مناسب نمی باشد', 422);
	}
	const { name, email, password } = req.body;

	const hasUser = DUMMY_USERS.find((u) => u.email === email);
	if (hasUser) {
		throw new HttpError('قبلا ثبت نام کردید', 422);
	}

	const createdUser = {
		id: uuid(),
		name,
		email,
		password
	};
	DUMMY_USERS.push(createdUser);

	res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
	const { email, passwod } = req.body;

	const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
	if (!identifiedUser || identifiedUser.password !== passwod) {
		throw new HttpError('اطلاعات وارده صحیح نمی باشد', 404);
	}
	res.json({ message: 'وارد شدید' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
