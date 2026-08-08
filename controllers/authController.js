const User = require('../model/userDB');

// GET /signup
const showSignup = (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('signup', {
    error: req.flash('error'),
    success: req.flash('success'),
    formData: req.flash('formData')[0] || {}
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

    // Check for existing user
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      req.flash('error', 'An account with this email already exists.');
      req.flash('formData', JSON.stringify({ username }));
      return res.redirect('/signup');
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      req.flash('error', 'This username is already taken.');
      req.flash('formData', JSON.stringify({ email }));
      return res.redirect('/signup');
    }

    // Determine role — admin if email matches env var
    const role = (email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase())
      ? 'admin'
      : 'user';

    const newUser = await User.create({ username, email, password, role });

    // Set session
    req.session.userId = newUser._id;
    req.session.username = newUser.username;
    req.session.userRole = newUser.role;

    req.flash('success', `Welcome to ClipNode, ${newUser.username}!`);
    res.redirect('/');
  } catch (err) {
    console.error('Signup error:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/signup');
  }
};

// GET /login
const showLogin = (req, res) => {
  if (req.session.userId) return res.redirect('/');
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.userRole = user.role;

    req.flash('success', `Welcome back, ${user.username}!`);
    res.redirect('/');
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
