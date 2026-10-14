const express = require('express');
const router = express.Router({ mergeParams: true });
const apiDocController = require('../controllers/apiDocController');

router.get('/', apiDocController.getAllApiDocs);
router.get('/:id', apiDocController.getApiDocById);
router.post('/', apiDocController.createApiDoc);
router.put('/:id', apiDocController.updateApiDoc);
router.delete('/:id', apiDocController.deleteApiDoc);

module.exports = router;
