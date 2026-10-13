const Project = require('../models/Project');
const ApiDocument = require('../models/ApiDocument');

// Lấy tất cả projects
const getAllProjects = async () => {
  const projects = await Project.find().sort({ createdAt: -1 });
  return projects;
};

// Lấy chi tiết 1 project theo ID
const getProjectById = async (id) => {
  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Không tìm thấy project');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

// Tạo project mới
const createProject = async (data) => {
  const project = await Project.create({
    name: data.name,
    description: data.description,
  });

  return project;
};

// Cập nhật project
const updateProject = async (id, data) => {
  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Không tìm thấy project');
    error.statusCode = 404;
    throw error;
  }

  project.name = data.name ?? project.name;
  project.description = data.description ?? project.description;

  const updatedProject = await project.save();
  return updatedProject;
};

// Xóa project và tất cả API documents thuộc project đó
const deleteProject = async (id) => {
  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Không tìm thấy project');
    error.statusCode = 404;
    throw error;
  }

  // Xóa tất cả API documents thuộc project này trước
  await ApiDocument.deleteMany({ projectId: id });

  // Sau đó xóa project
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
