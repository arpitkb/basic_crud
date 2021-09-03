const express = require('express')
const passport = require('passport')
const User = require('../models/user')
const wrapAsync = require('../utils/wrapAsync')
const router = express.Router({ mergeParams: true })
const Farm = require('../models/farm')

const { isLoggedin } = require('../middleware.js')

router.post('/signup', wrapAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to Farms')
            res.redirect('/farms');
        })
    }
    catch (e) {
        req.flash('error', e.message)
        res.redirect('/signup')
    }
}))

router.get('/signup', (req, res) => {
    res.render('user/signup')
})



router.get('/login', (req, res) => {
    res.render('user/login')
})


router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', `Welcome back ${req.user.username}`)
    const rediectUrl = req.session.returnTo || '/'
    delete req.session.returnTo
    res.redirect(rediectUrl)
})

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', 'Logged out successfully')
    res.redirect('/')
})


router.get('/me', isLoggedin, wrapAsync(async (req, res) => {
    const id = req.user._id;
    const ownerr = await User.findById(id);
    const farm = await Farm.findOne({ owner: ownerr })
    res.render('user/profile', { farm })
}))

module.exports = router