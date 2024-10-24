const validateEmail = email => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).trim().toLowerCase());
};

const validatePassword = password => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).{8,}$/;
    return re.test(String(password).trim());
};

function validate(input) {
    const { email, confirmEmail, password, confirmPassword } = input;
    const trimmedEmail = email.trim();
    const trimmedConfirmEmail = confirmEmail.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedEmail || !trimmedConfirmEmail) {
        return { valid: false, message: 'Email fields cannot be empty' };
    }
    if (!trimmedPassword || !trimmedConfirmPassword) {
        return { valid: false, message: 'Password fields cannot be empty' };
    }

    if (trimmedEmail !== trimmedConfirmEmail) {
        return { valid: false, message: 'Emails do not match' };
    }

    if (!validateEmail(trimmedEmail)) {
        return { valid: false, message: 'Invalid email format' };
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
        return { valid: false, message: 'Passwords do not match' };
    }

    if (!validatePassword(trimmedPassword)) {
        return {
            valid: false,
            message:
                'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 symbol, and 1 number',
        };
    }

    return { valid: true, message: 'Signup data is valid' };
}

export default validate;
