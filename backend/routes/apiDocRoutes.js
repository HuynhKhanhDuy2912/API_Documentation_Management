const express = require('express');
const router = express.Router({ mergeParams: true });
const apiDocController = require('../controllers/apiDocController');
const { validateApiDoc } = require('../middlewares/validators');

router.get('/', apiDocController.getAllApiDocs);
router.get('/:id', apiDocController.getApiDocById);
router.post('/', validateApiDoc, apiDocController.createApiDoc);
router.put('/:id', validateApiDoc, apiDocController.updateApiDoc);
router.delete('/:id', apiDocController.deleteApiDoc);

module.exports = router;
