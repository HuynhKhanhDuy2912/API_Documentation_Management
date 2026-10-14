import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', baseUrl: '' });
  const [baseUrlError, setBaseUrlError] = useState('');

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProjects();
  }, [debouncedSearch]);

  const fetchProjects = async () => {
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await getProjects(params);
      setProjects(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lấy danh sách projects');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', baseUrl: '' });
    setBaseUrlError('');
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description, baseUrl: project.baseUrl || '' });
    setBaseUrlError('');
    setModalOpen(true);
  };

  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.baseUrl && !isValidUrl(formData.baseUrl)) {
      setBaseUrlError('URL không hợp lệ. Phải bắt đầu bằng http:// hoặc https://');
      return;
    }
    setBaseUrlError('');

    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);
        toast.success('Cập nhật project thành công');
      } else {
        await createProject(formData);
        toast.success('Tạo project thành công');
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Lỗi khi lưu project');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(deletingId);
      setConfirmOpen(false);
      setDeletingId(null);
      toast.success('Đã xóa project');
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Quản Lý Project</h1>
          <p className="text-sm text-dark-muted mt-1">{projects.length} project</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo Project
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm project theo tên hoặc mô tả..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-lg text-dark-text text-sm placeholder-dark-muted focus:outline-none focus:border-primary transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-dark-border flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-dark-text mb-1">
            {debouncedSearch ? 'Không tìm thấy project' : 'Chưa có project nào'}
          </h3>
          <p className="text-sm text-dark-muted mb-4">
            {debouncedSearch
              ? `Không có kết quả cho "${debouncedSearch}"`
              : 'Tạo project đầu tiên để bắt đầu quản lý API'}
          </p>
          {!debouncedSearch && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Tạo Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-primary/50 transition-all duration-200 group"
            >
              <Link to={`/projects/${project._id}`} className="no-underline">
                <h3 className="text-base font-semibold text-dark-text group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-dark-muted mt-2 line-clamp-2">
                  {project.description || 'Chưa có mô tả'}
                </p>
                {project.baseUrl && (
                  <p className="text-xs text-dark-muted font-mono mt-2 truncate">{project.baseUrl}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-dark-muted">
                    {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {project.apiCount || 0} APIs
                  </span>
                </div>
              </Link>

              <div className="flex gap-2 mt-4 pt-4 border-t border-dark-border">
                <button
                  onClick={() => openEditModal(project)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-dark-muted hover:text-dark-text hover:bg-dark-border rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Sửa
                </button>
                <button
                  onClick={() => {
                    setDeletingId(project._id);
                    setConfirmOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-dark-muted hover:text-delete hover:bg-delete/10 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setBaseUrlError('');
        }}
        title={editingProject ? 'Cập nhật Project' : 'Tạo Project mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1.5">Tên Project *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên project..."
              required
              className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-lg text-dark-text text-sm placeholder-dark-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1.5">Base URL</label>
            <input
              type="text"
              value={formData.baseUrl || ''}
              onChange={(e) => {
                setFormData({ ...formData, baseUrl: e.target.value });
                if (baseUrlError) setBaseUrlError('');
              }}
              placeholder="VD: https://api.example.com/v1"
              className={`w-full px-4 py-2.5 bg-dark border rounded-lg text-dark-text text-sm placeholder-dark-muted focus:outline-none transition-colors font-mono ${baseUrlError ? 'border-delete focus:border-delete' : 'border-dark-border focus:border-primary'
                }`}
            />
            {baseUrlError && (
              <p className="text-xs text-delete mt-1">{baseUrlError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1.5">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả project..."
              rows={3}
              className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-lg text-dark-text text-sm placeholder-dark-muted focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setBaseUrlError('');
              }}
              className="px-4 py-2.5 border border-dark-border text-dark-text text-sm rounded-lg hover:bg-dark-border transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
            >
              {editingProject ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Xóa Project"
        message="Bạn có chắc muốn xóa project này? Tất cả API documents bên trong sẽ bị xóa."
      />
    </div>
  );
}
