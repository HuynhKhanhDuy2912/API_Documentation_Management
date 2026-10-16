import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  buildSampleRequestUrl,
  getEndpointPathError,
  getPathParameterNames,
  joinBaseUrl,
  normalizeEndpointPath,
  normalizeRequestParams,
} from '../utils/requestParameters';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const DATA_TYPES = ['String', 'Number', 'Boolean', 'Object', 'Array', 'Date'];

const METHOD_STYLES = {
  GET: {
    badge: 'bg-get/15 text-get border-get/30',
    activeBtn: 'bg-get text-dark shadow-get/20 shadow-lg',
    indicator: 'text-get',
    border: 'border-get/40',
  },
  POST: {
    badge: 'bg-post/15 text-post border-post/30',
    activeBtn: 'bg-post text-dark shadow-post/20 shadow-lg',
    indicator: 'text-post',
    border: 'border-post/40',
  },
  PUT: {
    badge: 'bg-put/15 text-put border-put/30',
    activeBtn: 'bg-put text-dark shadow-put/20 shadow-lg',
    indicator: 'text-put',
    border: 'border-put/40',
  },
  PATCH: {
    badge: 'bg-patch/15 text-patch border-patch/30',
    activeBtn: 'bg-patch text-dark shadow-patch/20 shadow-lg',
    indicator: 'text-patch',
    border: 'border-patch/40',
  },
  DELETE: {
    badge: 'bg-delete/15 text-delete border-delete/30',
    activeBtn: 'bg-delete text-dark shadow-delete/20 shadow-lg',
    indicator: 'text-delete',
    border: 'border-delete/40',
  },
};

const TYPE_COLORS = {
  String: 'text-get bg-get/10 border-get/20',
  Number: 'text-post bg-post/10 border-post/20',
  Boolean: 'text-put bg-put/10 border-put/20',
  Object: 'text-patch bg-patch/10 border-patch/20',
  Array: 'text-primary bg-primary/10 border-primary/20',
  Date: 'text-primary bg-primary/10 border-primary/20',
};

const emptyHeader = { key: '', value: '', description: '' };
const emptyField = { name: '', type: 'String', description: '', required: false, example: '' };
const emptyResponseField = { name: '', type: 'String', description: '', example: '' };

const isValidStructuredExample = (type, example) => {
  const value = String(example || '').trim();
  if (!value) return true;

  try {
    const parsed = JSON.parse(value);
    return type === 'Array'
      ? Array.isArray(parsed)
      : parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed);
  } catch {
    return false;
  }
};

const COMMON_HEADERS = [
  { key: 'Authorization', value: 'Bearer {{token}}', description: 'Token xác thực' },
  { key: 'Content-Type', value: 'application/json', description: 'Định dạng dữ liệu JSON' },
  { key: 'Accept', value: 'application/json', description: 'Định dạng chấp nhận' },
];

export default function ApiDocForm({ initialData, onSubmit, onCancel, baseUrl = '' }) {
  const [activeTab, setActiveTab] = useState('general');
  const [requestSubTab, setRequestSubTab] = useState('params');
  const [parameterLocationTab, setParameterLocationTab] = useState('path');

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    url: normalizeEndpointPath(initialData?.url || ''),
    method: initialData?.method || 'GET',
    description: initialData?.description || '',
    headers: initialData?.headers?.length ? initialData.headers : [],
    requestParams: normalizeRequestParams(
      initialData?.requestParams || [],
      initialData?.url || ''
    ),
    requestBody: initialData?.requestBody?.length ? initialData.requestBody : [],
    response: initialData?.response?.length ? initialData.response : [],
  });

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [endpointError, setEndpointError] = useState('');

  const requestParamEntries = formData.requestParams.map((parameter, index) => ({
    parameter,
    index,
  }));
  const pathParamEntries = requestParamEntries.filter(({ parameter }) => parameter.in === 'path');
  const queryParamEntries = requestParamEntries.filter(({ parameter }) => parameter.in === 'query');
  const visibleParamEntries = parameterLocationTab === 'path' ? pathParamEntries : queryParamEntries;

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
    if (field === 'url' && endpointError) setEndpointError('');
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

  const addRequestParameter = (location) => {
    const nextPathName = location === 'path'
      ? [...getPathParameterNames(formData.url)].find((name) =>
        !formData.requestParams.some((parameter) => parameter.in === 'path' && parameter.name === name)
      ) || ''
      : '';

    addItem('requestParams', {
      ...emptyField,
      name: nextPathName,
      in: location,
      required: location === 'path',
    });
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

    const normalizedUrl = normalizeEndpointPath(String(formData.url || '').trim());
    const endpointValidationError = getEndpointPathError(normalizedUrl);
    if (endpointValidationError) {
      setEndpointError(endpointValidationError);
      toast.error(endpointValidationError);
      return;
    }
    setEndpointError('');

    const missingHeaderIndex = formData.headers.findIndex(
      (header) => !String(header?.key || '').trim()
    );
    if (missingHeaderIndex !== -1) {
      setActiveTab('request');
      setRequestSubTab('headers');
      toast.error(`Header thứ ${missingHeaderIndex + 1}: vui lòng nhập tên key.`);
      return;
    }

    const missingHeaderValueIndex = formData.headers.findIndex(
      (header) => !String(header?.value || '').trim()
    );
    if (missingHeaderValueIndex !== -1) {
      setActiveTab('request');
      setRequestSubTab('headers');
      toast.error(`Header thứ ${missingHeaderValueIndex + 1}: vui lòng nhập value.`);
      return;
    }

    const missingParameterIndex = formData.requestParams.findIndex(
      (parameter) => !String(parameter?.name || '').trim()
    );
    if (missingParameterIndex !== -1) {
      const location = formData.requestParams[missingParameterIndex]?.in === 'path' ? 'path' : 'query';
      setActiveTab('request');
      setRequestSubTab('params');
      setParameterLocationTab(location);
      toast.error(`Request parameter thứ ${missingParameterIndex + 1}: vui lòng nhập tên trường.`);
      return;
    }

    const missingBodyFieldIndex = formData.requestBody.findIndex(
      (field) => !String(field?.name || '').trim()
    );
    if (missingBodyFieldIndex !== -1) {
      setActiveTab('request');
      setRequestSubTab('body');
      toast.error(`Request body thứ ${missingBodyFieldIndex + 1}: vui lòng nhập tên trường.`);
      return;
    }

    const missingResponseFieldIndex = formData.response.findIndex(
      (field) => !String(field?.name || '').trim()
    );
    if (missingResponseFieldIndex !== -1) {
      setActiveTab('response');
      toast.error(`Response thứ ${missingResponseFieldIndex + 1}: vui lòng nhập tên trường.`);
      return;
    }

    const invalidBodyExampleIndex = formData.requestBody.findIndex(
      (field) => ['Array', 'Object'].includes(field.type)
        && !isValidStructuredExample(field.type, field.example)
    );
    if (invalidBodyExampleIndex !== -1) {
      const field = formData.requestBody[invalidBodyExampleIndex];
      setActiveTab('request');
      setRequestSubTab('body');
      toast.error(`Giá trị mẫu của "${field.name}" phải là JSON ${field.type} hợp lệ.`);
      return;
    }

    const invalidResponseExampleIndex = formData.response.findIndex(
      (field) => ['Array', 'Object'].includes(field.type)
        && !isValidStructuredExample(field.type, field.example)
    );
    if (invalidResponseExampleIndex !== -1) {
      const field = formData.response[invalidResponseExampleIndex];
      setActiveTab('response');
      toast.error(`Giá trị mẫu của "${field.name}" phải là JSON ${field.type} hợp lệ.`);
      return;
    }

    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      url: normalizedUrl,
      description: formData.description.trim(),
      headers: formData.headers.map((header) => ({
        ...header,
        key: String(header.key).trim(),
        value: String(header.value).trim(),
      })),
      requestParams: normalizeRequestParams(
        formData.requestParams.map((parameter) => ({
          ...parameter,
          name: String(parameter.name).trim(),
        })),
        normalizedUrl
      ),
      requestBody: formData.requestBody.map((field) => ({
        ...field,
        name: String(field.name).trim(),
      })),
      response: formData.response.map((field) => ({
        ...field,
        name: String(field.name).trim(),
      })),
    };

    onSubmit(cleanedData);
  };

  const fullDisplayUrl = joinBaseUrl(baseUrl, formData.url);
  const sampleRequestUrl = buildSampleRequestUrl(
    baseUrl,
    formData.url,
    formData.requestParams
  );

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
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Top Method & Endpoint Bar */}
      <div className="p-6 border-b border-dark-border bg-dark/30 space-y-4">
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
            className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-xl text-dark-text text-sm font-medium placeholder-dark-muted focus:outline-none focus:border-blue-600 transition-colors"
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
                placeholder="/api/v1/users/{userId}"
                required
                aria-invalid={Boolean(endpointError)}
                aria-describedby={endpointError ? 'endpoint-error' : undefined}
                className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-dark-text font-mono text-sm placeholder-dark-muted focus:outline-none transition-colors ${endpointError ? 'border-delete focus:border-delete' : 'border-dark-border focus:border-blue-600'}`}
              />
            </div>
          </div>
          {endpointError && (
            <p id="endpoint-error" role="alert" className="mt-1.5 text-xs text-delete">
              {endpointError}
            </p>
          )}

          {/* Full URL Live Preview */}
          {baseUrl && (
            <div className="mt-2.5 flex items-center justify-between text-xs px-3.5 py-2 bg-dark/60 border border-dark-border/60 rounded-lg">
              <div className="flex items-center gap-2 overflow-hidden truncate">
                <span className="text-dark-muted shrink-0">URL đầy đủ:</span>
                <span className="font-mono truncate">
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
            ? 'border-blue-600 text-blue-600 font-semibold'
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
            ? 'border-blue-600 text-blue-600 font-semibold'
            : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Request
          {totalRequestItems > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-600/20 text-blue-600">
              {totalRequestItems}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('response')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'response'
            ? 'border-blue-600 text-blue-600 font-semibold'
            : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Response
          {formData.response.length > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-600/20 text-blue-600">
              {formData.response.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'preview'
            ? 'border-blue-600 text-blue-600 font-semibold'
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
      <div className="p-6">
        {/* TAB 1: GENERAL INFO */}
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-full">
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
                className="w-full px-4 py-3 bg-dark border border-dark-border rounded-xl text-dark-text text-sm placeholder-dark-muted focus:outline-none focus:border-blue-600 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Documentation Overview Card */}
            <div className="p-4 rounded-xl bg-dark/40 border border-dark-border/80 space-y-3">
              <h4 className="text-xs font-semibold text-dark-text uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span className="font-semibold text-dark-text">
                    {pathParamEntries.length} path · {queryParamEntries.length} query
                  </span>
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
            <div className="flex items-center gap-2 p-1 bg-dark/60 border border-dark-border/80 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setRequestSubTab('params')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${requestSubTab === 'params'
                  ? 'bg-blue-600 text-white shadow'
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
                  ? 'bg-blue-600 text-white shadow'
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
                  ? 'bg-blue-600 text-white shadow'
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
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 p-1 bg-dark/60 border border-dark-border/80 rounded-xl w-fit">
                  {[
                    { value: 'path', label: 'Path', count: pathParamEntries.length },
                    { value: 'query', label: 'Query', count: queryParamEntries.length },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setParameterLocationTab(tab.value)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${parameterLocationTab === tab.value
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-dark-muted hover:text-dark-text'
                        }`}
                    >
                      <span>{tab.label} Parameters</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${parameterLocationTab === tab.value
                        ? 'bg-white/20 text-white'
                        : 'bg-dark-border text-dark-muted'
                        }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <FieldTableEditor
                  title={parameterLocationTab === 'path' ? 'Path Parameters' : 'Query Parameters'}
                  subtitle={parameterLocationTab === 'path'
                    ? 'Tham số nằm trong endpoint, ví dụ /users/{userId}. Path parameter luôn bắt buộc.'
                    : 'Tham số truy vấn được gửi sau dấu ?, ví dụ ?status=active. Có thể bắt buộc hoặc tùy chọn.'}
                  items={visibleParamEntries.map(({ parameter }) => parameter)}
                  hasRequired
                  requiredLocked={parameterLocationTab === 'path'}
                  onAdd={() => addRequestParameter(parameterLocationTab)}
                  onUpdate={(idx, key, value) => updateItem(
                    'requestParams',
                    visibleParamEntries[idx].index,
                    key,
                    value
                  )}
                  onRemove={(idx) => removeItem('requestParams', visibleParamEntries[idx].index)}
                />
              </div>
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
                supportsStructuredExample
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
              supportsStructuredExample
              onAdd={() => addItem('response', emptyResponseField)}
              onUpdate={(idx, k, v) => updateItem('response', idx, k, v)}
              onRemove={(idx) => removeItem('response', idx)}
            />
          </div>
        )}

        {/* TAB 4: PREVIEW */}
        {activeTab === 'preview' && (
          <DocPreview
            formData={formData}
            sampleRequestUrl={sampleRequestUrl}
          />
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border bg-dark/50 sticky bottom-0 z-20 backdrop-blur-md rounded-b-xl">
        <div className="flex items-center gap-3 text-xs text-dark-muted hidden sm:flex">
          <span className="flex items-center gap-1.5">
            <span className={`w-1 h-1 rounded-full ${formData.name ? 'bg-get' : 'bg-dark-muted'}`} />
            {formData.name || 'Chưa đặt tên API'}
          </span>
          <span className={`w-1 h-1 rounded-full bg-dark-muted`} />
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
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue/25 transition-all cursor-pointer"
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer w-fit"
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
                  <th className="py-2.5 px-3 w-1/3">Value *</th>
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
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text font-mono text-xs placeholder-dark-muted focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.value || ''}
                        onChange={(e) => onUpdate(index, 'value', e.target.value)}
                        placeholder="VD: Bearer {{token}}"
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text font-mono text-xs placeholder-dark-muted focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => onUpdate(index, 'description', e.target.value)}
                        placeholder="Mô tả ý nghĩa của header này..."
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text text-xs placeholder-dark-muted focus:outline-none focus:border-blue-600 transition-colors"
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
function FieldTableEditor({
  title,
  subtitle,
  items,
  hasRequired,
  supportsStructuredExample = false,
  requiredLocked = false,
  onAdd,
  onUpdate,
  onRemove,
}) {
  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-dark-text flex items-center gap-2">
            {title} ({items.length})
          </h3>
          {subtitle && <p className="text-xs text-dark-muted mt-0.5">{subtitle}</p>}
          {supportsStructuredExample && (
            <p className="mt-1 text-xs text-primary-light/80">
              Với kiểu Array hoặc Object, nhập JSON hợp lệ vào Giá trị mẫu.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer w-fit"
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
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text font-mono text-xs placeholder-dark-muted focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </td>

                    {/* Kiểu dữ liệu */}
                    <td className="p-2">
                      <select
                        value={item.type || 'String'}
                        onChange={(e) => onUpdate(index, 'type', e.target.value)}
                        className={`w-full px-2 py-1.5 bg-dark border border-dark-border/80 rounded-lg font-mono text-xs font-semibold focus:outline-none focus:border-blue-600 transition-colors cursor-pointer ${TYPE_COLORS[item.type] || 'text-dark-text'
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
                          {requiredLocked ? (
                            <span className="text-[11px] font-semibold text-white">Luôn bắt buộc</span>
                          ) : (
                            <>
                              <input
                                type="checkbox"
                                checked={item.required || false}
                                onChange={(e) => onUpdate(index, 'required', e.target.checked)}
                                className="w-4 h-4 accent-blue rounded cursor-pointer"
                              />
                              <span
                                className={`text-[11px] font-semibold ${item.required ? 'text-white' : 'text-dark-muted'
                                  }`}
                              >
                                {item.required ? 'Có' : 'Không'}
                              </span>
                            </>
                          )}
                        </label>
                      </td>
                    )}

                    {/* Giá trị mẫu (Example) */}
                    <td className="p-2">
                      {supportsStructuredExample && ['Array', 'Object'].includes(item.type) ? (
                        <textarea
                          rows={4}
                          value={item.example || ''}
                          onChange={(e) => onUpdate(index, 'example', e.target.value)}
                          placeholder={item.type === 'Array'
                            ? '[\n  {"productId":"prod_001","quantity":2},\n  {"productId":"prod_002","quantity":1}\n]'
                            : '{\n  "street":"123 Nguyễn Trãi",\n  "city":"TP.HCM"\n}'}
                          className="w-full min-w-64 resize-y rounded-lg border border-dark-border/80 bg-dark px-2.5 py-1.5 font-mono text-xs text-dark-text placeholder:text-dark-muted focus:border-blue-600 focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={item.example || ''}
                          onChange={(e) => onUpdate(index, 'example', e.target.value)}
                          placeholder="VD: user@example.com"
                          className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text font-mono text-xs placeholder-dark-muted focus:outline-none focus:border-blue-600 transition-colors"
                        />
                      )}
                    </td>

                    {/* Mô tả */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => onUpdate(index, 'description', e.target.value)}
                        placeholder="Mô tả ý nghĩa của trường này..."
                        className="w-full px-2.5 py-1.5 bg-dark border border-dark-border/80 rounded-lg text-dark-text text-xs placeholder-dark-muted focus:outline-none focus:border-blue-600 transition-colors"
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
        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {buttonLabel}
      </button>
    </div>
  );
}

function DocPreview({ formData, sampleRequestUrl }) {
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
        let parsedExample;
        try {
          parsedExample = f.example ? JSON.parse(f.example) : [];
        } catch {
          parsedExample = null;
        }
        obj[f.name] = Array.isArray(parsedExample)
          ? parsedExample
          : (f.example ? [f.example] : []);
      } else if (f.type === 'Object') {
        let parsedExample;
        try {
          parsedExample = f.example ? JSON.parse(f.example) : {};
        } catch {
          parsedExample = null;
        }
        obj[f.name] = parsedExample !== null
          && typeof parsedExample === 'object'
          && !Array.isArray(parsedExample)
          ? parsedExample
          : {};
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
          <span className="text-[10px] uppercase tracking-wide text-dark-muted">URL mẫu</span>
          <span className="font-mono text-sm text-dark-text font-semibold break-all">
            {sampleRequestUrl || '/...'}
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
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full" />
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
                    <td className="py-2 px-3 font-mono text-blue-600 font-medium">{h.key}</td>
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
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full" />
            Parameters ({formData.requestParams.length})
          </h4>
          <div className="border border-dark-border rounded-xl overflow-hidden bg-dark/30">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-dark/70 text-dark-muted border-b border-dark-border">
                  <th className="py-2 px-3">Tên</th>
                  <th className="py-2 px-3">Vị trí</th>
                  <th className="py-2 px-3">Kiểu</th>
                  <th className="py-2 px-3">Bắt buộc</th>
                  <th className="py-2 px-3">Ví dụ</th>
                  <th className="py-2 px-3">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {formData.requestParams.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-mono text-blue-600 font-medium">{p.name}</td>
                    <td className="py-2 px-3 text-dark-muted">{p.in === 'path' ? 'Path' : 'Query'}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${TYPE_COLORS[p.type] || ''}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {p.required ? (
                        <span className="text-white font-semibold">Có</span>
                      ) : (
                        <span className="text-dark-muted">Không</span>
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
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full" />
            Request Body ({formData.requestBody.length} trường)
          </h4>
          {sampleBodyJson && (
            <div className="p-3 bg-dark rounded-xl border border-dark-border font-mono text-xs text-get overflow-x-auto custom-scrollbar">
              <pre>{sampleBodyJson}</pre>
            </div>
          )}
        </div>
      )}

      {/* Response Preview */}
      {formData.response.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full" />
            Response Schema ({formData.response.length} trường)
          </h4>
          {sampleResponseJson && (
            <div className="p-3 bg-dark rounded-xl border border-dark-border font-mono text-xs text-post overflow-x-auto custom-scrollbar">
              <pre>{sampleResponseJson}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
