const apiDocService = require('../services/apiDocService');

const getAllApiDocs = async (req, res, next) => {
  try {
    const apiDocs = await apiDocService.getAllByProject(req.params.projectId);

    res.status(200).json({
      success: true,
      count: apiDocs.length,
      data: apiDocs,
    });
  } catch (error) {
    next(error);
  }
};

const getApiDocById = async (req, res, next) => {
  try {
    const apiDoc = await apiDocService.getById(req.params.projectId, req.params.id);

    res.status(200).json({
      success: true,
      data: apiDoc,
    });
  } catch (error) {
    next(error);
  }
};

const createApiDoc = async (req, res, next) => {
  try {
    const apiDoc = await apiDocService.create(req.params.projectId, req.body);

    res.status(201).json({
      success: true,
      data: apiDoc,
    });
  } catch (error) {
    next(error);
  }
};

const updateApiDoc = async (req, res, next) => {
  try {
    const apiDoc = await apiDocService.update(
      req.params.projectId,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: apiDoc,
    });
  } catch (error) {
    next(error);
  }
};

const deleteApiDoc = async (req, res, next) => {
  try {
    const result = await apiDocService.remove(req.params.projectId, req.params.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllApiDocs,
  getApiDocById,
  createApiDoc,
  updateApiDoc,
  deleteApiDoc,
};
