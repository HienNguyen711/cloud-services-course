'use strict';

const express = require('express');
const images = require('../lib/images');
const oauth2 = require('../lib/oauth2');
//getModel
function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
router.use(oauth2.template);

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

/**
 * GET /products/add
 *
 * Display a list of products . limit 10
 */
router.get('/', (req, res, next) => {
  getModel().list(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('products/list.pug', {
      products: entities,
      nextPageToken: cursor
    });
  });
});

// Use the oauth2.required middleware to ensure that only logged-in users
// can access this handler.
router.get('/mine', oauth2.required, (req, res, next) => {
  getModel().listBy(
    req.user.id,
    10,
    req.query.pageToken,
    (err, entities, cursor, apiResponse) => {
      if (err) {
        next(err);
        return;
      }
      res.render('products/list.pug', {
        products: entities,
        nextPageToken: cursor
      });
    }
  );
});

/**
 * GET /products/add
 *
 * Display a form for creating a product
 */
router.get('/add', (req, res) => {
  res.render('products/form.pug', {
    product: {},
    action: 'Add'
  });
});

/**
 * POST /products/add
 *
 * Create a product
 */
// [START add]
router.post(
  '/add',
  images.multer.single('image'),
  images.sendUploadToGCS,
  (req, res, next) => {
    const data = req.body;

    // If the user is logged in, set them as the creator of the product.
    if (req.user) {
      data.createdBy = req.user.displayName;
      data.createdById = req.user.id;
    } else {
      data.createdBy = 'Anonymous';
    }

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      data.imageUrl = req.file.cloudStoragePublicUrl;
    }

    // Save the data to the database.
    getModel().create(data, (err, savedData) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect(`${req.baseUrl}/${savedData.id}`);
    });
  }
);
// [END add]

/**
 * GET /products/:id/edit
 *
 * Display a product for editing.
 */
router.get('/:productId/edit', (req, res, next) => {
  getModel().read(req.params.productId, (err, entity) => {
    if (err) {
      //if error > next middleware with error
      next(err);
      return;
    }
    res.render('products/form.pug', {
      product: entity,
      action: 'Edit'
    });
  });
});

/**
 * POST /products/:id/edit
 *
 * Update a product.
 */
router.post(
  '/:productId/edit',
  images.multer.single('image'),
  images.sendUploadToGCS,
  (req, res, next) => {
    const data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
  // use the public
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      req.body.imageUrl = req.file.cloudStoragePublicUrl;
    }

    getModel().update(req.params.productId, data, (err, savedData) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect(`${req.baseUrl}/${savedData.id}`);
    });
  }
);

/**
 * GET /products/:id
 *
 * get a product by id
 */
router.get('/:productId', (req, res, next) => {
  getModel().read(req.params.productId, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('products/view.pug', {
      product: entity
    });
  });
});

/**
 * GET /products/:id/delete
 *
 * Delete a product by id
 */
router.get('/:productId/delete', (req, res, next) => {
  getModel().delete(req.params.productId, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

/**
 * Errors on "/products/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and > format the error for logging
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;
// crud with product model
