import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, Trash2, Search, Plus, X, Folder } from 'lucide-react';
import { getProjectById, getApiDocs, createApiDoc, updateApiDoc, deleteApiDoc } from '../services/api';
import MethodBadge from '../components/MethodBadge';
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

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);

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

  useEffect(() => {
    setSelectedDocId((currentId) => (
      currentId && !apiDocs.some((doc) => doc._id === currentId) ? null : currentId
    ));
  }, [apiDocs]);

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
      let savedDoc;
      if (editingDoc) {
        const response = await updateApiDoc(projectId, editingDoc._id, data);
        savedDoc = response.data.data;
        toast.success('Cập nhật API thành công');
      } else {
        const response = await createApiDoc(projectId, data);
        savedDoc = response.data.data;
        toast.success('Tạo API thành công');
      }
      setSelectedDocId(savedDoc._id);
      setFormOpen(false);
      await fetchData();
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
  const selectedDoc = sortedDocs.find((doc) => doc._id === selectedDocId) || null;

  return (
    <div>
      {formOpen ? (
        <>
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="inline-flex items-center gap-2 text-sm font-medium text-dark-muted transition-colors hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {editingDoc && selectedDocId === editingDoc._id
                ? 'Quay lại chi tiết API'
                : 'Quay lại project'}
            </button>
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-dark-text">
                {editingDoc ? 'Chỉnh sửa API' : 'Thêm API mới'}
              </h1>
              <p className="mt-1 text-sm text-dark-muted">Project: {project.name}</p>
            </div>
          </div>

          <div className="w-full rounded-xl border border-dark-border bg-dark-card">
            <ApiDocForm
              initialData={editingDoc}
              onSubmit={handleSave}
              onCancel={() => setFormOpen(false)}
              baseUrl={project.baseUrl}
            />
          </div>
        </>
      ) : selectedDoc ? (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2 text-sm text-dark-muted">
                <Link to="/" className="shrink-0 transition-colors hover:text-dark-text">Projects</Link>
                <span>/</span>
                <span className="truncate text-dark-text">
                  {project.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocId(null)}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-dark-muted transition-colors hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Tất cả API
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => openEditForm(selectedDoc)}
                className="inline-flex items-center gap-2 rounded-lg border border-dark-border px-3.5 py-2 text-sm font-medium text-dark-text transition-colors hover:bg-dark-card"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Sửa
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeletingId(selectedDoc._id);
                  setConfirmOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-delete/30 px-3.5 py-2 text-sm font-medium text-delete transition-colors hover:bg-delete/10"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Xóa
              </button>
            </div>
          </div>

          <div className="w-full rounded-xl border border-dark-border bg-dark-card p-4 sm:p-6 lg:p-8">
            <ApiDocDetail doc={selectedDoc} baseUrl={project.baseUrl} />
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-2 text-sm text-dark-muted">
            <Link to="/" className="transition-colors hover:text-dark-text">Projects</Link>
            <span>/</span>
            <span className="text-dark-text">{project.name}</span>
          </div>

          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-dark-text">{project.name}</h1>
              {project.description && (
                <p className="mt-1 text-sm text-dark-muted">{project.description}</p>
              )}
              {project.baseUrl && (
                <p className="mt-2 inline-block rounded bg-dark-border/50 px-2 py-1 font-mono text-xs text-dark-muted">
                  {project.baseUrl}
                </p>
              )}
              <p className="mt-2 text-sm text-dark-muted">{apiDocs.length} API endpoints</p>
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Thêm API
            </button>
          </div>

          <div className="mb-6 flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-muted" aria-hidden="true" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm API theo tên, URL hoặc mô tả..."
                aria-label="Tìm API"
                className="w-full rounded-lg border border-dark-border bg-dark-card py-2.5 pl-10 pr-10 text-sm text-dark-text placeholder-dark-muted transition-colors focus:border-blue-600 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted transition-colors hover:text-dark-text"
                  aria-label="Xóa nội dung tìm kiếm"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilterMethod('')}
                className={"rounded-lg border px-3 py-2 text-xs font-medium transition-colors " + (
                  filterMethod === ''
                    ? 'border-primary/30 bg-blue/10 text-blue-600'
                    : 'border-dark-border bg-dark-card text-dark-muted hover:text-dark-text'
                )}
              >
                ALL
              </button>
              {METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFilterMethod(filterMethod === method ? '' : method)}
                  className={"rounded-lg border px-3 py-2 text-xs font-medium transition-colors " + (
                    filterMethod === method
                      ? methodColors[method]
                      : 'border-dark-border bg-dark-card text-dark-muted hover:text-dark-text'
                  )}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {sortedDocs.length === 0 ? (
            <div className="rounded-xl border border-dark-border bg-dark-card px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-dark-border text-dark-muted">
                <Folder className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-dark-text">
                {debouncedSearch || filterMethod ? 'Không tìm thấy API' : 'Chưa có API nào'}
              </h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-dark-muted">
                {debouncedSearch || filterMethod
                  ? 'Thử thay đổi từ khóa hoặc bộ lọc.'
                  : 'Thêm API endpoint đầu tiên cho project này.'}
              </p>
              {!debouncedSearch && !filterMethod && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Thêm API
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedDocs.map((doc) => (
                <div
                  key={doc._id}
                  className="group rounded-xl border border-dark-border bg-dark-card p-4 transition-colors hover:border-blue-600"
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDocId(doc._id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <MethodBadge method={doc.method} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-dark-text transition-colors group-hover:text-blue-600">
                          {doc.name}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-xs text-dark-muted">
                          {joinBaseUrl(project.baseUrl, doc.url)}
                        </span>
                      </span>
                    </button>

                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEditForm(doc)}
                        className="rounded-lg p-2 text-dark-muted transition-colors hover:bg-dark-border hover:text-dark-text"
                        title="Sửa"
                        aria-label={"Sửa " + doc.name}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingId(doc._id);
                          setConfirmOpen(true);
                        }}
                        className="rounded-lg p-2 text-dark-muted transition-colors hover:bg-delete/10 hover:text-delete"
                        title="Xóa"
                        aria-label={"Xóa " + doc.name}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {doc.description && (
                    <p className="ml-[76px] mt-2 text-xs text-dark-muted">{doc.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

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
