const ApiDocument = require('../models/ApiDocument');
const Project = require('../models/Project');

// Kiểm tra project có tồn tại không
const checkProjectExists = async (projectId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    const error = new Error('Không tìm thấy project');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

// Lấy tất cả API documents của 1 project
const getAllByProject = async (projectId) => {
  await checkProjectExists(projectId);

  const apiDocs = await ApiDocument.find({ projectId }).sort({ createdAt: -1 });
  return apiDocs;
};

// Lấy chi tiết 1 API document
const getById = async (projectId, id) => {
  await checkProjectExists(projectId);

  const apiDoc = await ApiDocument.findOne({ _id: id, projectId });

  if (!apiDoc) {
    const error = new Error('Không tìm thấy API document');
    error.statusCode = 404;
    throw error;
  }

  return apiDoc;
};

// Tạo API document mới
const create = async (projectId, data) => {
  await checkProjectExists(projectId);

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

// Cập nhật API document
const update = async (projectId, id, data) => {
  await checkProjectExists(projectId);

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

// Xóa API document
const remove = async (projectId, id) => {
  await checkProjectExists(projectId);

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
