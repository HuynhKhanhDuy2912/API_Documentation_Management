const Project = require('../models/Project');
const ApiDocument = require('../models/ApiDocument');

const getAllProjects = async (userId, query = {}) => {
  const filter = { userId };

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
    ];
  }

  const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();

  const counts = await ApiDocument.aggregate([
    { $match: { projectId: { $in: projects.map((p) => p._id) } } },
    { $group: { _id: '$projectId', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    countMap[c._id.toString()] = c.count;
  });

  const result = projects.map((p) => ({
    ...p,
    apiCount: countMap[p._id.toString()] || 0,
  }));

  return result;
};

const getProjectById = async (id, userId) => {
  const project = await Project.findOne({ _id: id, userId });

  if (!project) {
    const error = new Error('Không tìm thấy project');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

const createProject = async (userId, data) => {
  const project = await Project.create({
    name: data.name,
    description: data.description,
    baseUrl: data.baseUrl,
    userId,
  });

  return project;
};

const updateProject = async (id, userId, data) => {
  const project = await Project.findOne({ _id: id, userId });

  if (!project) {
    const error = new Error('Không tìm thấy project');
    error.statusCode = 404;
    throw error;
  }

  project.name = data.name ?? project.name;
  project.description = data.description ?? project.description;
  project.baseUrl = data.baseUrl ?? project.baseUrl;

  const updatedProject = await project.save();
  return updatedProject;
};

const deleteProject = async (id, userId) => {
  const project = await Project.findOne({ _id: id, userId });

  if (!project) {
    const error = new Error('Không tìm thấy project');
    error.statusCode = 404;
    throw error;
  }

  await ApiDocument.deleteMany({ projectId: id });
  await project.deleteOne();

  return { message: 'Đã xóa project và tất cả API documents liên quan' };
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
