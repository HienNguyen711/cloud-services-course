'use strict';

const utils = require('../lib/utils');



/**
 * handler
 * @param: event, context, callback
 */


module.exports.handler = (event, context, callback) => {

    console.log(event);
    utils.successHandler(event, callback);
};
