const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { validateProject } = require('../middlewares/validators');

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', validateProject, projectController.createProject);
router.put('/:id', validateProject, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
