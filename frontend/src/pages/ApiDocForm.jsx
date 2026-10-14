import { useState, useEffect } from 'react';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const DATA_TYPES = ['String', 'Number', 'Boolean', 'Object', 'Array', 'Date'];

const METHOD_STYLES = {
  GET: {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    activeBtn: 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg',
    indicator: 'text-emerald-400',
    border: 'border-emerald-500/40',
  },
  POST: {
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    activeBtn: 'bg-orange-500 text-white shadow-orange-500/20 shadow-lg',
    indicator: 'text-orange-400',
    border: 'border-orange-500/40',
  },
  PUT: {
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    activeBtn: 'bg-blue-500 text-white shadow-blue-500/20 shadow-lg',
    indicator: 'text-blue-400',
    border: 'border-blue-500/40',
  },
  PATCH: {
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    activeBtn: 'bg-purple-500 text-white shadow-purple-500/20 shadow-lg',
    indicator: 'text-purple-400',
    border: 'border-purple-500/40',
  },
  DELETE: {
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    activeBtn: 'bg-rose-500 text-white shadow-rose-500/20 shadow-lg',
    indicator: 'text-rose-400',
    border: 'border-rose-500/40',
  },
};

const TYPE_COLORS = {
  String: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Number: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Boolean: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Object: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Array: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  Date: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
};

const emptyHeader = { key: '', value: '', description: '' };
const emptyField = { name: '', type: 'String', description: '', required: false, example: '' };
const emptyResponseField = { name: '', type: 'String', description: '', example: '' };

const COMMON_HEADERS = [
  { key: 'Authorization', value: 'Bearer {{token}}', description: 'Token xác thực' },
  { key: 'Content-Type', value: 'application/json', description: 'Định dạng dữ liệu JSON' },
  { key: 'Accept', value: 'application/json', description: 'Định dạng chấp nhận' },
];

export default function ApiDocForm({ initialData, onSubmit, onCancel, baseUrl = '' }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'request' | 'response' | 'preview'
  const [requestSubTab, setRequestSubTab] = useState('params'); // 'params' | 'headers' | 'body'

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    url: initialData?.url || '',
    method: initialData?.method || 'GET',
    description: initialData?.description || '',
    headers: initialData?.headers?.length ? initialData.headers : [],
    requestParams: initialData?.requestParams?.length ? initialData.requestParams : [],
    requestBody: initialData?.requestBody?.length ? initialData.requestBody : [],
    response: initialData?.response?.length ? initialData.response : [],
  });

  const [copiedUrl, setCopiedUrl] = useState(false);

  // Keyboard shortcut Ctrl+S / Cmd+S to submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = (field, emptyItem) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], { ...emptyItem }],
    }));
  };

  const updateItem = (field, index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const removeItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addHeaderPreset = (preset) => {
    // Check if key already exists
    const exists = formData.headers.some(
      (h) => h.key.toLowerCase() === preset.key.toLowerCase()
    );
    if (!exists) {
      setFormData((prev) => ({
        ...prev,
        headers: [...prev.headers, { ...preset }],
      }));
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Clean up empty rows so backend validation does not reject
    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      url: formData.url.trim(),
      description: formData.description.trim(),
      headers: formData.headers.filter((h) => h.key && h.key.trim() !== ''),
      requestParams: formData.requestParams.filter((p) => p.name && p.name.trim() !== ''),
      requestBody: formData.requestBody.filter((b) => b.name && b.name.trim() !== ''),
      response: formData.response.filter((r) => r.name && r.name.trim() !== ''),
    };

    onSubmit(cleanedData);
  };

  const fullDisplayUrl = baseUrl
    ? `${baseUrl}${formData.url ? (formData.url.startsWith('/') ? formData.url : `/${formData.url}`) : ''}`
    : formData.url;

  const copyFullUrl = () => {
    if (!fullDisplayUrl) return;
    navigator.clipboard.writeText(fullDisplayUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const totalRequestItems =
    formData.headers.length +
    formData.requestParams.length +
    formData.requestBody.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Top Method & Endpoint Bar */}
      <div className="p-6 border-b border-dark-border bg-dark/30 space-y-4">
        {/* API Name input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">
            Tên API <span className="text-delete">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="VD: Đăng ký tài khoản người dùng mới"
            required
            className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-xl text-dark-text text-sm font-medium placeholder-dark-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Method selector & URL Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">
            Endpoint & Phương thức HTTP <span className="text-delete">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Method Select */}
            <div className="relative sm:w-36 shrink-0">
              <select
                value={formData.method}
                onChange={(e) => handleChange('method', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer appearance-none bg-dark ${METHOD_STYLES[formData.method]?.badge || 'text-dark-text'
                  } ${METHOD_STYLES[formData.method]?.border || 'border-dark-border'}`}
              >
                {METHODS.map((m) => (
                  <option key={m} value={m} className="bg-dark-card text-dark-text">
                    {m}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* URL Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="/api/v1/auth/register"
                required
                className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-xl text-dark-text font-mono text-sm placeholder-dark-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Full URL Live Preview */}
          {baseUrl && (
            <div className="mt-2.5 flex items-center justify-between text-xs px-3.5 py-2 bg-dark/60 border border-dark-border/60 rounded-lg">
              <div className="flex items-center gap-2 overflow-hidden truncate">
                <span className="text-dark-muted shrink-0">URL đầy đủ:</span>
                <span className="font-mono text-primary truncate">
                  {fullDisplayUrl || `${baseUrl}/...`}
                </span>
              </div>
              <button
                type="button"
                onClick={copyFullUrl}
                className="ml-2 text-dark-muted hover:text-dark-text text-[11px] shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                title="Sao chép URL đầy đủ"
              >
                {copiedUrl ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-get" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-get">Đã chép</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="flex items-center gap-2 px-6 border-b border-dark-border bg-dark/20 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'general'
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Thông tin chung
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('request')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'request'
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Request
          {totalRequestItems > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-primary/20 text-primary">
              {totalRequestItems}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('response')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'response'
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Response
          {formData.response.length > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-primary/20 text-primary">
              {formData.response.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'preview'
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Xem trước (Preview)
        </button>
      </div>

      {/* Tab Contents Area */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {/* TAB 1: GENERAL INFO */}
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-3xl">
            {/* Method selection card buttons */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-2">
                Chọn phương thức HTTP
              </label>
              <div className="flex flex-wrap gap-2">
                {METHODS.map((m) => {
                  const isSelected = formData.method === m;
                  const style = METHOD_STYLES[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleChange('method', m)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${isSelected
                        ? `${style.activeBtn} border-transparent`
                        : 'bg-dark border-dark-border text-dark-muted hover:text-dark-text hover:border-dark-muted/60'
                        }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description textarea */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-2">
                Mô tả chi tiết chức năng
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Nhập mô tả hoạt động của API, các quyền cần có (roles/permissions), logic xử lý chính hoặc các mã lỗi cần lưu ý..."
                rows={5}
                className="w-full px-4 py-3 bg-dark border border-dark-border rounded-xl text-dark-text text-sm placeholder-dark-muted focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Documentation Overview Card */}
            <div className="p-4 rounded-xl bg-dark/40 border border-dark-border/80 space-y-3">
              <h4 className="text-xs font-semibold text-dark-text uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tóm tắt cấu hình API
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-dark/60 rounded-lg border border-dark-border/40">
                  <span className="text-dark-muted block mb-1">Phương thức</span>
                  <span className={`font-bold ${METHOD_STYLES[formData.method]?.indicator}`}>
                    {formData.method}
                  </span>
                </div>
                <div className="p-3 bg-dark/60 rounded-lg border border-dark-border/40">
                  <span className="text-dark-muted block mb-1">Parameters</span>
                  <span className="font-semibold text-dark-text">{formData.requestParams.length} trường</span>
                </div>
                <div className="p-3 bg-dark/60 rounded-lg border border-dark-border/40">
                  <span className="text-dark-muted block mb-1">Headers</span>
                  <span className="font-semibold text-dark-text">{formData.headers.length} header</span>
                </div>
                <div className="p-3 bg-dark/60 rounded-lg border border-dark-border/40">
                  <span className="text-dark-muted block mb-1">Response</span>
                  <span className="font-semibold text-dark-text">{formData.response.length} trường</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REQUEST */}
        {activeTab === 'request' && (
          <div className="space-y-5">
            {/* Request Sub-tabs (Parameters, Headers, Body) */}
            <div className="flex items-center gap-2 p-1 bg-dark/60 border border-dark-border/80 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setRequestSubTab('params')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${requestSubTab === 'params'
                  ? 'bg-primary text-white shadow'
                  : 'text-dark-muted hover:text-dark-text'
                  }`}
              >
                <span>Parameters</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${requestSubTab === 'params'
                    ? 'bg-white/20 text-white'
                    : 'bg-dark-border text-dark-muted'
                    }`}
                >
                  {formData.requestParams.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRequestSubTab('headers')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${requestSubTab === 'headers'
                  ? 'bg-primary text-white shadow'
                  : 'text-dark-muted hover:text-dark-text'
                  }`}
              >
                <span>Headers</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${requestSubTab === 'headers'
                    ? 'bg-white/20 text-white'
                    : 'bg-dark-border text-dark-muted'
                    }`}
                >
                  {formData.headers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRequestSubTab('body')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${requestSubTab === 'body'
                  ? 'bg-primary text-white shadow'
                  : 'text-dark-muted hover:text-dark-text'
                  }`}
              >
                <span>Request Body</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${requestSubTab === 'body'
                    ? 'bg-white/20 text-white'
                    : 'bg-dark-border text-dark-muted'
                    }`}
                >
                  {formData.requestBody.length}
                </span>
              </button>
            </div>

            {/* Sub-tab 1: Parameters */}
            {requestSubTab === 'params' && (
              <FieldTableEditor
                title="Request Parameters"
                subtitle="Các tham số truyền qua URL dạng Query String (?key=value) hoặc Path Variable (/users/:id)"
                items={formData.requestParams}
                hasRequired
                onAdd={() => addItem('requestParams', emptyField)}
                onUpdate={(idx, k, v) => updateItem('requestParams', idx, k, v)}
                onRemove={(idx) => removeItem('requestParams', idx)}
              />
            )}

            {/* Sub-tab 2: Headers */}
            {requestSubTab === 'headers' && (
              <HeadersTableEditor
                items={formData.headers}
                onAdd={() => addItem('headers', emptyHeader)}
                onAddPreset={addHeaderPreset}
                onUpdate={(idx, k, v) => updateItem('headers', idx, k, v)}
                onRemove={(idx) => removeItem('headers', idx)}
              />
            )}

            {/* Sub-tab 3: Request Body */}
            {requestSubTab === 'body' && (
              <FieldTableEditor
                title="Request Body"
                subtitle="Cấu trúc dữ liệu JSON gửi lên trong phần Body (áp dụng cho POST, PUT, PATCH)"
                items={formData.requestBody}
                hasRequired
                onAdd={() => addItem('requestBody', emptyField)}
                onUpdate={(idx, k, v) => updateItem('requestBody', idx, k, v)}
                onRemove={(idx) => removeItem('requestBody', idx)}
              />
            )}
          </div>
        )}

        {/* TAB 3: RESPONSE */}
        {activeTab === 'response' && (
          <div className="space-y-5">
            <FieldTableEditor
              title="Response Schema"
              subtitle="Cấu trúc các trường dữ liệu được trả về từ máy chủ sau khi xử lý thành công"
              items={formData.response}
              hasRequired={false}
              onAdd={() => addItem('response', emptyResponseField)}
              onUpdate={(idx, k, v) => updateItem('response', idx, k, v)}
              onRemove={(idx) => removeItem('response', idx)}
            />
          </div>
        )}

        {/* TAB 4: SWAGGER / POSTMAN LIVE PREVIEW */}
        {activeTab === 'preview' && (
          <DocPreview
            formData={formData}
            baseUrl={baseUrl}
            fullDisplayUrl={fullDisplayUrl}
          />
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border bg-dark/50 sticky bottom-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3 text-xs text-dark-muted hidden sm:flex">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${formData.name ? 'bg-get' : 'bg-dark-muted'}`} />
            {formData.name || 'Chưa đặt tên API'}
          </span>
          <span>•</span>
          <span className="font-mono text-dark-text">{formData.method}</span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-dark-border text-dark-text text-sm rounded-xl hover:bg-dark-border/60 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all cursor-pointer"
          >
            <span>{initialData ? 'Cập nhật API' : 'Lưu API Document'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

// -------------------------------------------------------------
// Headers Table Editor Component
// -------------------------------------------------------------
function HeadersTableEditor({ items, onAdd, onAddPreset, onUpdate, onRemove }) {
  return (
    <div className="space-y-4">
      {/* Header controls & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-dark-text flex items-center gap-2">
            Headers ({items.length})
          </h3>
          <p className="text-xs text-dark-muted mt-0.5">
            Các HTTP Header gửi kèm trong request (ví dụ: Authorization, Content-Type)
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer w-fit"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm Header
        </button>
      </div>

      {/* Presets Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-dark-muted font-medium">Gợi ý nhanh:</span>
        {COMMON_HEADERS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => onAddPreset(preset)}
            className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-dark border border-dark-border/80 text-dark-muted hover:text-dark-text hover:border-primary/50 transition-colors cursor-pointer"
          >
            + {preset.key}
          </button>
        ))}
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <EmptyState
          title="Chưa có Header nào"
          description="Thêm các Header bảo mật, token xác thực hoặc chỉ định định dạng nội dung cho API."
          buttonLabel="Thêm Header đầu tiên"
          onAdd={onAdd}
        />
      ) : (
        <div className="border border-dark-border rounded-xl overflow-hidden bg-dark/20">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-dark/80 text-dark-muted font-semibold uppercase tracking-wider border-b border-dark-border">
                  <th className="py-2.5 px-3 w-1/4">Key *</th>
                  <th className="py-2.5 px-3 w-1/3">Value</th>
                  <th className="py-2.5 px-3">Mô tả</th>
                  <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-dark-border/20 transition-colors">
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.key || ''}
                        onChange={(e) => onUpdate(index, 'key', e.target.value)}
                        placeholder="VD: Authorization"
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text font-mono text-xs placeholder-dark-muted focus:outline-none focus:border-primary transition-colors"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.value || ''}
                        onChange={(e) => onUpdate(index, 'value', e.target.value)}
                        placeholder="VD: Bearer {{token}}"
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text font-mono text-xs placeholder-dark-muted focus:outline-none focus:border-primary transition-colors"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => onUpdate(index, 'description', e.target.value)}
                        placeholder="Mô tả ý nghĩa của header này..."
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text text-xs placeholder-dark-muted focus:outline-none focus:border-primary transition-colors"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="p-1.5 text-dark-muted hover:text-delete hover:bg-delete/10 rounded-lg transition-colors cursor-pointer"
                        title="Xóa dòng"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Parameters / Body / Response Table Editor Component
// -------------------------------------------------------------
function FieldTableEditor({ title, subtitle, items, hasRequired, onAdd, onUpdate, onRemove }) {
  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-dark-text flex items-center gap-2">
            {title} ({items.length})
          </h3>
          {subtitle && <p className="text-xs text-dark-muted mt-0.5">{subtitle}</p>}
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer w-fit"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm trường
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={`Chưa có trường nào trong ${title}`}
          description="Bấm nút bên dưới để khai báo các trường dữ liệu và kiểu dữ liệu tương ứng."
          buttonLabel="Thêm trường mới"
          onAdd={onAdd}
        />
      ) : (
        <div className="border border-dark-border rounded-xl overflow-hidden bg-dark/20">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-dark/80 text-dark-muted font-semibold uppercase tracking-wider border-b border-dark-border">
                  <th className="py-2.5 px-3 w-1/4">Tên trường *</th>
                  <th className="py-2.5 px-3 w-28">Kiểu</th>
                  {hasRequired && (
                    <th className="py-2.5 px-3 w-24 text-center">Bắt buộc</th>
                  )}
                  <th className="py-2.5 px-3 w-1/4">Giá trị mẫu</th>
                  <th className="py-2.5 px-3">Mô tả</th>
                  <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-dark-border/20 transition-colors">
                    {/* Tên trường */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => onUpdate(index, 'name', e.target.value)}
                        placeholder="VD: email"
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text font-mono text-xs placeholder-dark-muted focus:outline-none focus:border-primary transition-colors"
                      />
                    </td>

                    {/* Kiểu dữ liệu */}
                    <td className="p-2">
                      <select
                        value={item.type || 'String'}
                        onChange={(e) => onUpdate(index, 'type', e.target.value)}
                        className={`w-full px-2 py-1.5 bg-dark border border-dark-border/80 rounded-lg font-mono text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer ${TYPE_COLORS[item.type] || 'text-dark-text'
                          }`}
                      >
                        {DATA_TYPES.map((t) => (
                          <option key={t} value={t} className="bg-dark-card text-dark-text font-sans">
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Bắt buộc (checkbox/switch) */}
                    {hasRequired && (
                      <td className="p-2 text-center">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.required || false}
                            onChange={(e) => onUpdate(index, 'required', e.target.checked)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                          <span
                            className={`text-[11px] font-semibold ${item.required ? 'text-delete' : 'text-dark-muted'
                              }`}
                          >
                            {item.required ? 'Có' : 'Không'}
                          </span>
                        </label>
                      </td>
                    )}

                    {/* Giá trị mẫu (Example) */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.example || ''}
                        onChange={(e) => onUpdate(index, 'example', e.target.value)}
                        placeholder="VD: user@example.com"
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text font-mono text-xs placeholder-dark-muted focus:outline-none focus:border-primary transition-colors"
                      />
                    </td>

                    {/* Mô tả */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => onUpdate(index, 'description', e.target.value)}
                        placeholder="Mô tả ý nghĩa của trường này..."
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text text-xs placeholder-dark-muted focus:outline-none focus:border-primary transition-colors"
                      />
                    </td>

                    {/* Nút xóa */}
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="p-1.5 text-dark-muted hover:text-delete hover:bg-delete/10 rounded-lg transition-colors cursor-pointer"
                        title="Xóa dòng"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Empty State Placeholder Component
// -------------------------------------------------------------
function EmptyState({ title, description, buttonLabel, onAdd }) {
  return (
    <div className="text-center py-8 px-4 rounded-xl border border-dashed border-dark-border bg-dark/20">
      <div className="w-10 h-10 rounded-full bg-dark-border/50 flex items-center justify-center mx-auto mb-2 text-dark-muted">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <p className="text-xs font-semibold text-dark-text mb-1">{title}</p>
      <p className="text-xs text-dark-muted max-w-sm mx-auto mb-3">{description}</p>
      <button
        type="button"
        onClick={onAdd}
        className="px-3.5 py-1.5 bg-dark-border/80 hover:bg-dark-border text-dark-text text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {buttonLabel}
      </button>
    </div>
  );
}

// -------------------------------------------------------------
// Live Swagger / Postman Style Preview Component
// -------------------------------------------------------------
function DocPreview({ formData, baseUrl, fullDisplayUrl }) {
  // Generate sample JSON body from fields
  const generateSampleJson = (fields) => {
    if (!fields || fields.length === 0) return null;
    const obj = {};
    fields.forEach((f) => {
      if (!f.name) return;
      if (f.type === 'Number') {
        obj[f.name] = f.example ? Number(f.example) : 0;
      } else if (f.type === 'Boolean') {
        obj[f.name] = f.example === 'true' || f.example === '1';
      } else if (f.type === 'Array') {
        obj[f.name] = f.example ? [f.example] : [];
      } else if (f.type === 'Object') {
        obj[f.name] = {};
      } else {
        obj[f.name] = f.example || 'string';
      }
    });
    return JSON.stringify(obj, null, 2);
  };

  const sampleBodyJson = generateSampleJson(formData.requestBody);
  const sampleResponseJson = generateSampleJson(formData.response);

  return (
    <div className="space-y-6">
      {/* Endpoint Header Preview */}
      <div className="p-4 rounded-xl bg-dark border border-dark-border space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${METHOD_STYLES[formData.method]?.badge || 'bg-dark-border text-dark-text'
              }`}
          >
            {formData.method}
          </span>
          <span className="font-mono text-sm text-dark-text font-semibold break-all">
            {fullDisplayUrl || '/...'}
          </span>
        </div>

        {formData.name && (
          <h3 className="text-base font-bold text-dark-text">{formData.name}</h3>
        )}

        {formData.description && (
          <p className="text-xs text-dark-muted leading-relaxed whitespace-pre-wrap">
            {formData.description}
          </p>
        )}
      </div>

      {/* Headers Preview */}
      {formData.headers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-dark-muted flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-primary rounded-full" />
            Headers ({formData.headers.length})
          </h4>
          <div className="border border-dark-border rounded-xl overflow-hidden bg-dark/30">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-dark/70 text-dark-muted border-b border-dark-border">
                  <th className="py-2 px-3">Key</th>
                  <th className="py-2 px-3">Value</th>
                  <th className="py-2 px-3">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {formData.headers.map((h, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-mono text-primary font-medium">{h.key}</td>
                    <td className="py-2 px-3 font-mono text-dark-text">{h.value || '—'}</td>
                    <td className="py-2 px-3 text-dark-muted">{h.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Parameters Preview */}
      {formData.requestParams.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-dark-muted flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-primary rounded-full" />
            Parameters ({formData.requestParams.length})
          </h4>
          <div className="border border-dark-border rounded-xl overflow-hidden bg-dark/30">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-dark/70 text-dark-muted border-b border-dark-border">
                  <th className="py-2 px-3">Tên</th>
                  <th className="py-2 px-3">Kiểu</th>
                  <th className="py-2 px-3">Bắt buộc</th>
                  <th className="py-2 px-3">Ví dụ</th>
                  <th className="py-2 px-3">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {formData.requestParams.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-mono text-primary font-medium">{p.name}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${TYPE_COLORS[p.type] || ''}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {p.required ? (
                        <span className="text-delete font-semibold">Bắt buộc</span>
                      ) : (
                        <span className="text-dark-muted">Tùy chọn</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-dark-muted">{p.example || '—'}</td>
                    <td className="py-2 px-3 text-dark-muted">{p.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Body & Sample JSON Preview */}
      {formData.requestBody.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-dark-muted flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-primary rounded-full" />
            Request Body ({formData.requestBody.length} trường)
          </h4>
          {sampleBodyJson && (
            <div className="p-3 bg-dark rounded-xl border border-dark-border font-mono text-xs text-emerald-400 overflow-x-auto custom-scrollbar">
              <pre>{sampleBodyJson}</pre>
            </div>
          )}
        </div>
      )}

      {/* Response Preview */}
      {formData.response.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-dark-muted flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-primary rounded-full" />
            Response Schema ({formData.response.length} trường)
          </h4>
          {sampleResponseJson && (
            <div className="p-3 bg-dark rounded-xl border border-dark-border font-mono text-xs text-blue-400 overflow-x-auto custom-scrollbar">
              <pre>{sampleResponseJson}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
