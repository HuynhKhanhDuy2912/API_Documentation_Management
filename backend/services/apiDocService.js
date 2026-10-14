const ApiDocument = require('../models/ApiDocument');
const Project = require('../models/Project');

const checkProjectOwnership = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId });

  if (!project) {
    const error = new Error('Không tìm thấy project');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

const getAllByProject = async (projectId, userId, query = {}) => {
  await checkProjectOwnership(projectId, userId);

  const filter = { projectId };

  // Filter by method
  if (query.method) {
    filter.method = query.method.toUpperCase();
  }

  // Search by name, url, or description
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { url: searchRegex },
      { description: searchRegex },
    ];
  }

  const apiDocs = await ApiDocument.find(filter).sort({ createdAt: -1 });
  return apiDocs;
};

const getById = async (projectId, id, userId) => {
  await checkProjectOwnership(projectId, userId);

  const apiDoc = await ApiDocument.findOne({ _id: id, projectId });

  if (!apiDoc) {
    const error = new Error('Không tìm thấy API document');
    error.statusCode = 404;
    throw error;
  }

  return apiDoc;
};

const create = async (projectId, userId, data) => {
  await checkProjectOwnership(projectId, userId);

  const apiDoc = await ApiDocument.create({
    projectId,
    name: data.name,
    url: data.url,
    method: data.method,
    description: data.description,
    headers: data.headers,
    requestParams: data.requestParams,
    requestBody: data.requestBody,
    response: data.response,
  });

  return apiDoc;
};

const update = async (projectId, id, userId, data) => {
  await checkProjectOwnership(projectId, userId);

  const apiDoc = await ApiDocument.findOne({ _id: id, projectId });

  if (!apiDoc) {
    const error = new Error('Không tìm thấy API document');
    error.statusCode = 404;
    throw error;
  }

  apiDoc.name = data.name ?? apiDoc.name;
  apiDoc.url = data.url ?? apiDoc.url;
  apiDoc.method = data.method ?? apiDoc.method;
  apiDoc.description = data.description ?? apiDoc.description;
  apiDoc.headers = data.headers ?? apiDoc.headers;
  apiDoc.requestParams = data.requestParams ?? apiDoc.requestParams;
  apiDoc.requestBody = data.requestBody ?? apiDoc.requestBody;
  apiDoc.response = data.response ?? apiDoc.response;

  const updatedApiDoc = await apiDoc.save();
  return updatedApiDoc;
};

const remove = async (projectId, id, userId) => {
  await checkProjectOwnership(projectId, userId);

  const apiDoc = await ApiDocument.findOne({ _id: id, projectId });

  if (!apiDoc) {
    const error = new Error('Không tìm thấy API document');
    error.statusCode = 404;
    throw error;
  }

  await apiDoc.deleteOne();

  return { message: 'Đã xóa API document' };
};

module.exports = {
  getAllByProject,
  getById,
  create,
  update,
  remove,
};
