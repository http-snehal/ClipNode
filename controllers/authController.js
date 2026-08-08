const User = require('../model/userDB');

// GET /signup
const showSignup = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/');
  const formDataRaw = req.flash('formData')[0];
  let formData = {};
  try { formData = formDataRaw ? JSON.parse(formDataRaw) : {}; } catch (e) { formData = {}; }
  res.render('signup', {
    error: req.flash('error'),
    success: req.flash('success'),
    formData
  });
};

// POST /signup
const handleSignup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      req.flash('error', 'All fields are required.');
      req.flash('formData', JSON.stringify({ username, email }));
      return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      req.flash('formData', JSON.stringify({ username, email }));
      return res.redirect('/signup');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      req.flash('formData', JSON.stringify({ username, email }));
      return res.redirect('/signup');
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      req.flash('error', 'An account with this email already exists.');
      req.flash('formData', JSON.stringify({ username }));
      return res.redirect('/signup');
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      req.flash('error', 'This username is already taken.');
      req.flash('formData', JSON.stringify({ email }));
      return res.redirect('/signup');
    }

    // Create user
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // Set session then save to store BEFORE redirecting
    req.session.userId   = newUser._id.toString();
    req.session.username = newUser.username;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error after signup:', err);
        req.flash('error', 'Account created but session failed. Please log in.');
        return res.redirect('/login');
      }
      res.redirect('/');
    });

  } catch (err) {
    console.error('Signup error:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/signup');
  }
};

// GET /login
const showLogin = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/');
  res.render('login', {
    error: req.flash('error'),
    success: req.flash('success')
  });
};

// POST /login
const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error', 'Email and password are required.');
      return res.redirect('/login');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    // Set session then save to store BEFORE redirecting
    req.session.userId   = user._id.toString();
    req.session.username = user.username;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error after login:', err);
        req.flash('error', 'Login failed. Please try again.');
        return res.redirect('/login');
      }
      res.redirect('/');
    });

  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/login');
  }
};

// POST /logout
const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/');
  });
};

module.exports = { showSignup, handleSignup, showLogin, handleLogin, handleLogout };
