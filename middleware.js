const AppError = require('./utils/AppError')
const { farmSchema, productSchema } = require('./validatorSchemas')
const Farm = require('./models/farm')
const Product = require('./models/product')

module.exports.validateFarm = (req, res, next) => {
    const { error } = farmSchema.validate(req.body)
    if (error) {
        const mssg = error.details.map(el => el.message).join(',')
        throw new AppError(mssg, 400)
    }
    else next()
}

module.exports.validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body)
    if (error) {
        const mssg = error.details.map(el => el.message).join(',')
        req.flash('error', mssg)
        return res.redirect('back')
        // throw new AppError(mssg, 400)
    }
    else next()
}

module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be logged in')
        return res.redirect('/login')
    }
    else next()
}


module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params
    const farm = await Farm.findById(id);
    if (!farm.owner.equals(req.user._id)) {
        req.flash('error', "You don't have the permission to do that")
        return res.redirect(`/farms/${id}`)
    }
    else next()
}



module.exports.isProductOwner = async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findById(id);
    const f_id = product.farm._id
    const farm = await Farm.findById(f_id);
    if (!farm.owner.equals(req.user._id)) {
        req.flash('error', "You don't have the permission to do that")
        return res.redirect(`/products/${id}`)
    }
    else next()
}


