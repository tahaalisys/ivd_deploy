function isPasswordComplex(password) {
  // Check if password has at least 8 characters
  if (password.length < 8) return false;

  // Check if password contains at least one special character
  const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharacters.test(password)) return false;

  // Check if password contains at least one digit
  const numbers = /\d/;
  if (!numbers.test(password)) return false;

  // Password meets complexity requirements
  return true;
}

module.exports = isPasswordComplex;
