const User = require('../model/userDB');

// GET /signup
const showSignup = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/');
  const formDataRaw = req.flash('formData')[0];
  let formData = {};
  try {
    formData = formDataRaw ? JSON.parse(formDataRaw) : {};
  } catch (e) {
    formData = {};
  }
  res.render('signup', {
    error: req.flash('error'),
    success: req.flash('success'),
    formData
  });
};

// POST /signup
const handleSignup = async (req, res) => {
  let username = '';
  let email = '';
  try {
    username = (req.body.username || '').trim();
    email = (req.body.email || '').trim().toLowerCase();
    const { password, confirmPassword } = req.body;

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      req.flash('error', 'All fields are required.');
      req.flash('formData', JSON.stringify({ username, email }));
      return res.redirect('/signup');
    }

    if (username.length < 3) {
      req.flash('error', 'Username must be at least 3 characters long.');
      req.flash('formData', JSON.stringify({ username, email }));
      return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      req.flash('formData', JSON.stringify({ username, email }));
      return res.redirect('/signup');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long.');
      req.flash('formData', JSON.stringify({ username, email }));
      return res.redirect('/signup');
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      req.flash('error', 'An account with this email already exists. Please log in.');
      req.flash('formData', JSON.stringify({ username }));
      return res.redirect('/signup');
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      req.flash('error', 'This username is already taken. Please choose another.');
      req.flash('formData', JSON.stringify({ email }));
      return res.redirect('/signup');
    }

    // Create user
    const newUser = await User.create({
      username,
      email,
      password
    });

    // Set session then save to store BEFORE redirecting
    req.session.userId   = newUser._id.toString();
    req.session.username = newUser.username;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error after signup:', err);
        req.flash('error', 'Account created but session initialization failed. Please log in.');
        return res.redirect('/login');
      }
      res.redirect('/');
    });

  } catch (err) {
    console.error('Signup error:', err);
    let errorMessage = 'Could not create account. Please check your details and try again.';
    
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      errorMessage = field === 'email' 
        ? 'An account with this email already exists.' 
        : 'This username is already taken.';
    } else if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(e => e.message).join('. ');
    }
    
    req.flash('error', errorMessage);
    req.flash('formData', JSON.stringify({ username, email }));
    res.redirect('/signup');
  }
};

// GET /login
const showLogin = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/');
  const formDataRaw = req.flash('formData')[0];
  let formData = {};
  try {
    formData = formDataRaw ? JSON.parse(formDataRaw) : {};
  } catch (e) {
    formData = {};
  }
  res.render('login', {
    error: req.flash('error'),
    success: req.flash('success'),
    formData
  });
};

// POST /login
const handleLogin = async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.username || '').trim();
    const password = req.body.password || '';

    if (!identifier || !password) {
      req.flash('error', 'Email/Username and password are required.');
      req.flash('formData', JSON.stringify({ identifier }));
      return res.redirect('/login');
    }

    // Find user by either email OR username (case-insensitive regex for username)
    const escapedIdentifier = identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: new RegExp(`^${escapedIdentifier}$`, 'i') }
      ]
    });

    if (!user) {
      req.flash('error', 'Invalid email/username or password.');
      req.flash('formData', JSON.stringify({ identifier }));
      return res.redirect('/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email/username or password.');
      req.flash('formData', JSON.stringify({ identifier }));
      return res.redirect('/login');
    }

    // Set session then save to store BEFORE redirecting
    req.session.userId   = user._id.toString();
    req.session.username = user.username;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error after login:', err);
        req.flash('error', 'Login failed to save session. Please try again.');
        return res.redirect('/login');
      }
      res.redirect('/');
    });

  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'An error occurred during login. Please try again.');
    res.redirect('/login');
  }
};

// POST /logout
const handleLogout = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) console.error('Logout error:', err);
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
};

module.exports = { showSignup, handleSignup, showLogin, handleLogin, handleLogout };
