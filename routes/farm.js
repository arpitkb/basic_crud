const express = require('express')
const router = express.Router({ mergeParams: true })

const { isLoggedin, validateFarm, validateProduct, isOwner } = require('../middleware.js')
const wrapAsync = require('../utils/wrapAsync')
const Farm = require('../models/farm')
const Product = require('../models/product')
const User = require('../models/user')

router.get('/', async (req, res) => {
    const farms = await Farm.find({}).populate('owner');
    res.render('farms/index', { farms })
})

router.get('/new', isLoggedin, wrapAsync(async (req, res) => {
    const id = req.user._id;
    const ownerr = await User.findById(id);
    const farm = await Farm.findOne({ owner: ownerr })
    // console.log(farm)
    if (!farm) {
        res.render('farms/new')
    }
    else {
        req.flash('error', 'You already have a farm')
        res.redirect(`/farms/${farm._id}`)
    }
}))

router.get('/me', isLoggedin, wrapAsync(async (req, res) => {
    const id = req.user._id;
    const ownerr = await User.findById(id);
    const farm = await Farm.findOne({ owner: ownerr })
    // console.log(farm)
    if (!farm) {
        req.flash('error', 'No farm found')
        res.redirect('/farms')
    }
    else {
        res.redirect(`/farms/${farm._id}`)
    }
}))

router.post('/', isLoggedin, validateFarm, wrapAsync(async (req, res) => {
    const newfarm = new Farm(req.body.farm);
    newfarm.owner = req.user._id;
    await newfarm.save();
    req.flash('success', 'succesfully created a new farm')
    res.redirect(`/farms/${newfarm._id}`)
}))


router.get('/:id/edit', isLoggedin, isOwner, wrapAsync(async (req, res) => {
    const farm = await Farm.findById(req.params.id)
    // console.log(farm)
    res.render('farms/edit', { farm })
}))


router.put('/:id', isLoggedin, isOwner, validateFarm, wrapAsync(async (req, res) => {
    const { id } = req.params
    const farm = await Farm.findByIdAndUpdate(id, { ...req.body.farm })
    // await newfarm.save();
    req.flash('success', `Succesfully updated ${farm.name}`)
    res.redirect(`/farms/${id}`)
}))


router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params
    const farm = await Farm.findById(id).populate('products').populate('owner');
    res.render('farms/show', { farm })
}))


router.get('/:id/products/new', isLoggedin, isOwner, async (req, res) => {
    const { id } = req.params
    const { name } = await Farm.findById(id)
    res.render('products/new', { id, name })
})


router.post('/:id/products', isLoggedin, isOwner, validateProduct, wrapAsync(async (req, res) => {
    const { id } = req.params
    const farm = await Farm.findById(id)

    const product = new Product(req.body.product)

    //relate both models
    farm.products.push(product)
    product.farm = farm

    //save both models
    await product.save()
    await farm.save();
    req.flash('success', 'Successfully Added a product')
    res.redirect(`/farms/${id}`)

}))


router.delete('/:id', isLoggedin, isOwner, wrapAsync(async (req, res) => {
    await Farm.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully deleted a farm')
    res.redirect('/farms')
}))

module.exports = router