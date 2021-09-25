function admin(req, res, next) {
    if (req.user.role !== 'admin') {
        req.flash('error', 'You are not authorized to view this content!')
        res.redirect('/menu')
    }
    next();
}

module.exports = admin