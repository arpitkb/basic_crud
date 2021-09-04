const Joi = require('joi')

module.exports.farmSchema = Joi.object({
    farm: Joi.object({
        name: Joi.string().required().max(15),
        city: Joi.string().required(),
        email: Joi.string().required(),
    }).required()
})



module.exports.productSchema = Joi.object({
    product: Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
        category: Joi.string().required().valid('fruit', 'vegetable', 'dairy')
    }).required()
})


