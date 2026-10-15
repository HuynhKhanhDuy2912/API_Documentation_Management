import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';
import { getProjectById, getApiDocs, createApiDoc, updateApiDoc, deleteApiDoc } from '../services/api';
import MethodBadge from '../components/MethodBadge';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import ConfirmDialog from '../components/ConfirmDialog';
import ApiDocForm from './ApiDocForm';
import ApiDocDetail from './ApiDocDetail';
import { joinBaseUrl } from '../utils/requestParameters';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [apiDocs, setApiDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [projectId, debouncedSearch, filterMethod]);

  const fetchData = async () => {
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterMethod) params.method = filterMethod;

      const [projectRes, apiDocsRes] = await Promise.all([
        getProjectById(projectId),
        getApiDocs(projectId, params),
      ]);
      setProject(projectRes.data.data);
      setApiDocs(apiDocsRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lấy dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingDoc(null);
    setFormOpen(true);
  };

  const openEditForm = (doc) => {
    setEditingDoc(doc);
    setFormOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingDoc) {
        await updateApiDoc(projectId, editingDoc._id, data);
        toast.success('Cập nhật API thành công');
      } else {
        await createApiDoc(projectId, data);
        toast.success('Tạo API thành công');
      }
      setFormOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Lỗi khi lưu API');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteApiDoc(projectId, deletingId);
      setConfirmOpen(false);
      setDeletingId(null);
      toast.success('Đã xóa API');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa API');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-medium text-dark-text">Không tìm thấy project</h3>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">← Quay lại</Link>
      </div>
    );
  }

  const methodOrder = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const sortedDocs = [...apiDocs].sort(
    (a, b) => methodOrder.indexOf(a.method) - methodOrder.indexOf(b.method)
  );

  const methodColors = {
    GET: 'bg-get/10 text-get border-get/30',
    POST: 'bg-post/10 text-post border-post/30',
    PUT: 'bg-put/10 text-put border-put/30',
    PATCH: 'bg-patch/10 text-patch border-patch/30',
    DELETE: 'bg-delete/10 text-delete border-delete/30',
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-dark-muted mb-6">
        <Link to="/" className="hover:text-dark-text transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-dark-text">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-dark-muted mt-1">{project.description}</p>
          )}
          {project.baseUrl && (
            <p className="text-xs text-dark-muted font-mono mt-2 px-2 py-1 bg-dark-border/50 rounded inline-block">{project.baseUrl}</p>
          )}
          <p className="text-sm text-dark-muted mt-2">{apiDocs.length} API endpoints</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm API
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm API theo tên, URL hoặc mô tả..."
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

        {/* Method Filter */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterMethod('')}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              filterMethod === ''
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-dark-card text-dark-muted border-dark-border hover:text-dark-text'
            }`}
          >
            Tất cả
          </button>
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setFilterMethod(filterMethod === m ? '' : m)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                filterMethod === m
                  ? methodColors[m]
                  : 'bg-dark-card text-dark-muted border-dark-border hover:text-dark-text'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* API List */}
      {sortedDocs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-dark-border flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-dark-text mb-1">
            {debouncedSearch || filterMethod ? 'Không tìm thấy API' : 'Chưa có API nào'}
          </h3>
          <p className="text-sm text-dark-muted mb-4">
            {debouncedSearch || filterMethod
              ? 'Thử thay đổi từ khóa hoặc bộ lọc'
              : 'Thêm API endpoint đầu tiên cho project này'}
          </p>
          {!debouncedSearch && !filterMethod && (
            <button
              onClick={openCreateForm}
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Thêm API
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDocs.map((doc) => (
            <div
              key={doc._id}
              className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => setViewingDoc(doc)}
                >
                  <MethodBadge method={doc.method} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-dark-text group-hover:text-primary transition-colors">
                        {doc.name}
                      </span>
                    </div>
                    <span className="text-xs text-dark-muted font-mono">
                      {joinBaseUrl(project.baseUrl, doc.url)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditForm(doc)}
                    className="p-2 text-dark-muted hover:text-dark-text hover:bg-dark-border rounded-lg transition-colors cursor-pointer"
                    title="Sửa"
                  >
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(doc._id);
                      setConfirmOpen(true);
                    }}
                    className="p-2 text-dark-muted hover:text-delete hover:bg-delete/10 rounded-lg transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {doc.description && (
                <p className="text-xs text-dark-muted mt-2 ml-[76px]">{doc.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit API Form Drawer */}
      <Drawer
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingDoc ? 'Cập nhật API Document' : 'Thêm API Document mới'}
        subtitle={project ? `Project: ${project.name}` : undefined}
      >
        <ApiDocForm
          initialData={editingDoc}
          onSubmit={handleSave}
          onCancel={() => setFormOpen(false)}
          baseUrl={project.baseUrl}
        />
      </Drawer>

      {/* View API Detail */}
      <Modal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title="Chi tiết API"
      >
        {viewingDoc && <ApiDocDetail doc={viewingDoc} baseUrl={project.baseUrl} />}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Xóa API"
        message="Bạn có chắc muốn xóa API document này?"
      />
    </div>
  );
}
