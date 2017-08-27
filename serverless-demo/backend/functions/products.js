'use strict';

const products = require('../lib/products');
const checkout = require('../lib/checkout');
const cart = require('../lib/cart');
const utils = require('../lib/utils');

module.exports.handler = (event, context, callback) => {

    let userId = 349264414701;

    if (event.requestContext.authorizer)
        userId = event.requestContext.authorizer.claims.sub;

    try {
        switch (`${event.httpMethod} ${event.resource}`) {
            //get list of products
            case 'GET /products':
                products.retrieveAll(null, callback);
                break;

            case 'GET /productsAuth':
                products.retrieveAll(userId, callback);
                break;


            case 'POST /cart':
                const selectedProducts = JSON.parse(event.body).products;
                cart.saveCart(userId, selectedProducts, callback);
                break;



            case 'OPTIONS /cart':
                utils.optionsHandler(callback);
                break;

            case 'PUT /checkout':
                const id = JSON.parse(event.body).id;
                checkout.processCheckout(id, callback);
                break;

            case 'OPTIONS /checkout':
                utils.optionsHandler(callback);
                break;

            default:
                utils.notFoundHandler(callback);
        }
    } catch (err) {
        utils.errorHandler(err, callback);
    }
};
