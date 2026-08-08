const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please log in to access this page.');
  res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    req.flash('error', 'Please log in to access this page.');
    return res.redirect('/login');
  }
  if (req.session.userRole !== 'admin') {
    return res.redirect('/');
  }
  next();
};

module.exports = { isAuthenticated, isAdmin };
