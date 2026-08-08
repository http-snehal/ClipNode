const User = require('../model/userDB');
const Paste = require('../model/pasteDB');

// GET /admin
const showAdmin = async (req, res) => {
  try {
    const [users, pastes, totalPastes] = await Promise.all([
      User.find().sort({ createdAt: -1 }).lean(),
      Paste.find()
        .sort({ createdAt: -1 })
        .populate('userId', 'username email')
        .lean(),
      Paste.countDocuments()
    ]);

    // Count pastes per user for the users table
    const pasteCounts = await Paste.aggregate([
      { $match: { userId: { $ne: null } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);
    const pasteCountMap = {};
    pasteCounts.forEach(({ _id, count }) => {
      pasteCountMap[_id.toString()] = count;
    });

    const stats = {
      totalUsers: users.length,
      totalPastes,
      activePastes: pastes.filter(p => !p.expiresAt || new Date(p.expiresAt) > new Date()).length
    };

    res.render('admin', {
      users,
      pastes,
      stats,
      pasteCountMap,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).send('Server Error');
  }
};

// POST /admin/delete-paste/:id
const deletePaste = async (req, res) => {
  try {
    await Paste.findByIdAndDelete(req.params.id);
    req.flash('success', 'Paste deleted successfully.');
    res.redirect('/admin');
  } catch (err) {
    console.error('Delete paste error:', err);
    req.flash('error', 'Failed to delete paste.');
    res.redirect('/admin');
  }
};

// POST /admin/delete-user/:id
const deleteUser = async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.session.userId.toString()) {
      req.flash('error', 'You cannot delete your own admin account.');
      return res.redirect('/admin');
    }
    await User.findByIdAndDelete(req.params.id);
    // Nullify their pastes instead of deleting (preserve content)
    await Paste.updateMany({ userId: req.params.id }, { userId: null });
    req.flash('success', 'User deleted. Their pastes are now anonymous.');
    res.redirect('/admin');
  } catch (err) {
    console.error('Delete user error:', err);
    req.flash('error', 'Failed to delete user.');
    res.redirect('/admin');
  }
};

module.exports = { showAdmin, deletePaste, deleteUser };
