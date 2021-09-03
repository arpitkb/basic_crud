if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config
}

const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const ejsMate = require('ejs-mate')
const farmRoutes = require('./routes/farm')
const productRoutes = require('./routes/product')
const userRoutes = require('./routes/user')
const AppError = require('./utils/AppError')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user');
const Farm = require('./models/farm');
const MongoDBStore = require('connect-mongo')


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/farmStand'
const secret = process.env.SECRET || 'thisisnotatallagoodsecret'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => {
        console.log('Database connected')
    })
    .catch((err) => {
        console.log('Mongo connection error!!')
        console.log(err);
    })

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))


const mongoOptions = {
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
}

app.use(session({
    store: MongoDBStore.create(mongoOptions),
    secret,
    name: 'session',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24
    }
}))

app.use(flash())

//passport configuration
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    next()
})



app.get('/', (req, res) => {
    res.render('home')
})

//=================== Farm routes


app.use('/farms', farmRoutes)

//==================== Product routes


app.use('/products', productRoutes)


//===================== User Routes

app.use('/', userRoutes)


//=======================


app.all('*', (req, res, next) => {
    next(new AppError("Page Not Found", 404))
})


app.use((err, req, res, next) => {
    const { status = 500 } = err
    err.message = "Something went wrong"
    res.status(status).render('user/error', { err })
})

app.listen('3000', () => {
    console.log('server running on port 3000')
})