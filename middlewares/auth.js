function auth(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash('error', 'login in to view this content');
        return res.redirect('/users/login');
    }
    next();
}

module.exports = auth