module.exports.validtateRegisterInput = (
	username,
	email,
	password,
	confirmPassword
) => {
	const errors = {};
	if (username.trim() === '') {
		errors.username = 'Username must not be empty';
	}
	if (email.trim() === '') {
		errors.email = 'Email must not be empty';
	} else {
		const regEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
		if (!email.match(regEx)) {
			errors.email = 'Not valid email address';
		}
	}

	if (password === '') {
		errors.password = 'Password must not empty';
	} else {
		if (confirmPassword !== password) {
			errors.confirmPassword = 'Passwords must match';
		}
	}

	return {
		errors,
		valid: Object.keys(errors).length < 1,
	};
};

module.exports.validtateLoginInput = (username, password) => {
	const errors = {};
	if (username.trim() === '') {
		errors.username = 'Username must not be empty';
	}
	if (password === '') {
		errors.password = 'Password must not be empty';
	}
	return {
		errors,
		valid: Object.keys(errors).length < 1,
	};
};
