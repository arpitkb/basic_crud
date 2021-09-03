const express = require('express')
const router = express.Router()

const { isLoggedin, validateProduct, isProductOwner } = require('../middleware.js')
const wrapAsync = require('../utils/wrapAsync')
const Product = require('../models/product')
const Farm = require('../models/farm')


router.get('/', async (req, res) => {
    const products = await Product.find({}).populate('farm');
    res.render('products/index', { products })
})


//for renderning form to create a new product

router.get('/filter/:cat', wrapAsync(async (req, res) => {
    const { cat } = req.params
    const products = await Product.find({ category: cat })
    res.render('products/filter', { products, cat })
}))



router.get('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findById(id).populate('farm', 'name')
    res.render('products/show', { product })
}))


//for updating

router.get('/:id/edit', isLoggedin, isProductOwner, wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findById(id)
    res.render('products/edit', { product })
}))

router.put('/:id', isLoggedin, isProductOwner, validateProduct, wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product })

    req.flash('success', `Successfully updated ${product.name}`)
    res.redirect(`/products/${product._id}`)
}))


//for deleting
router.delete('/:id', isLoggedin, isProductOwner, async (req, res) => {
    const { id } = req.params
    const product = await Product.findById(id)
    const farm = await Farm.findById(product.farm._id).populate('products', '_id')
    await Product.findByIdAndDelete(id)

    farm.products = farm.products.filter(c => {
        if (c._id == id) return false;
        return true;
    })

    await farm.save()
    req.flash('success', 'Successfully deleted a farm')
    res.redirect(`/farms/${farm._id}`)
})


module.exports = router