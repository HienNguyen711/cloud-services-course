'use strict';
//lib
const express = require('express');
const bodyParser = require('body-parser');
//getModel()
function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`); // modelrequire . config  get databackend
}

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/products
 *
 * Retrieve a product (up to ten at a time).
 */
router.get('/', (req, res, next) => {
  getModel().list(5, req.query.pageToken, (err, entities, cursor) => {

    if (err) {
      next(err);
      return;
    }
    res.json({
      items: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * POST /api/products
 *
 * Create a new product.
 */
router.post('/', (req, res, next) => {
  getModel().create(req.body, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * GET /api/products/:id
 *
 * Retrieve a product by Id.
 */
router.get('/:productId', (req, res, next) => {
  getModel().read(req.params.productId, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * PUT /api/products/:id
 *
 * Update a product by Id.
 */
router.put('/:productId', (req, res, next) => {
  getModel().update(req.params.productId, req.body, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * DELETE /api/products/:id
 *
 * Delete a product.
 */
router.delete('/:productId', (req, res, next) => {
  getModel().delete(req.params.productId, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.status(200).send('Successful delete a product');
  });
});

/**
 * Errors on "/api/products/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = {
    message: err.message,
    internalCode: err.code
  };
  next(err);
});

module.exports = router;
