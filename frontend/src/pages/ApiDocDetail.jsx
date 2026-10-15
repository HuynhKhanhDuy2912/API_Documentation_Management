import MethodBadge from '../components/MethodBadge';
import {
  buildSampleRequestUrl,
  joinBaseUrl,
  normalizeRequestParams,
} from '../utils/requestParameters';

export default function ApiDocDetail({ doc, baseUrl }) {
  const fullUrl = joinBaseUrl(baseUrl, doc.url);
  const requestParams = normalizeRequestParams(doc.requestParams || [], doc.url);
  const pathParams = requestParams.filter((parameter) => parameter.in === 'path');
  const queryParams = requestParams.filter((parameter) => parameter.in === 'query');
  const hasParameterExamples = requestParams.some((parameter) => String(parameter.example || '').trim());
  const sampleUrl = buildSampleRequestUrl(baseUrl, doc.url, requestParams);

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div>
        <div className="flex items-center gap-3">
          <MethodBadge method={doc.method} />
          <span className="text-sm font-mono text-dark-text break-all">{fullUrl}</span>
        </div>
        {baseUrl && (
          <p className="text-xs text-dark-muted mt-2">
            Base URL: <span className="font-mono">{baseUrl}</span> + <span className="font-mono">{doc.url}</span>
          </p>
        )}
        {hasParameterExamples && (
          <p className="text-xs text-dark-muted mt-2 break-all">
            URL mẫu: <span className="font-mono text-blue-500">{sampleUrl}</span>
          </p>
        )}
      </div>

      {/* Tên + Mô tả */}
      <div>
        <h1 className="text-xl font-semibold text-dark-text sm:text-2xl">{doc.name}</h1>
        {doc.description && (
          <p className="text-sm text-dark-muted mt-1">{doc.description}</p>
        )}
      </div>

      {/* Headers */}
      {doc.headers?.length > 0 && (
        <DetailSection title="Headers">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-s border-b border-dark-border">
                <th className="pb-2 font-medium">Key</th>
                <th className="pb-2 font-medium">Value</th>
                <th className="pb-2 font-medium">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {doc.headers.map((h, i) => (
                <tr key={i} className="border-b border-dark-border/50">
                  <td className="py-2 font-mono text-blue-500 text-s">{h.key}</td>
                  <td className="py-2 text-dark-muted text-s">{h.value}</td>
                  <td className="py-2 text-dark-muted text-s">{h.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetailSection>
      )}

      {/* Request Parameters */}
      {pathParams.length > 0 && (
        <DetailSection title="Path Parameters">
          <FieldTable fields={pathParams} showRequired />
        </DetailSection>
      )}

      {queryParams.length > 0 && (
        <DetailSection title="Query Parameters">
          <FieldTable fields={queryParams} showRequired />
        </DetailSection>
      )}

      {/* Request Body */}
      {doc.requestBody?.length > 0 && (
        <DetailSection title="Request Body">
          <FieldTable fields={doc.requestBody} showRequired />
        </DetailSection>
      )}

      {/* Response */}
      {doc.response?.length > 0 && (
        <DetailSection title="Response">
          <FieldTable fields={doc.response} />
        </DetailSection>
      )}
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-dark-text mb-3 flex items-center gap-2">
        <span className="w-1 h-5 bg-blue-500 rounded-full" />
        {title}
      </h4>
      {children}
    </div>
  );
}

function FieldTable({ fields, showRequired }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-s border-b border-dark-border">
          <th className="pb-2 font-medium">Tên trường</th>
          <th className="pb-2 font-medium">Kiểu dữ liệu</th>
          <th className="pb-2 font-medium">Mô tả</th>
          {showRequired && <th className="pb-2 font-medium">Bắt buộc</th>}
          <th className="pb-2 font-medium">Ví dụ</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((f, i) => (
          <tr key={i} className="border-b border-dark-border/50">
            <td className="py-2 font-mono text-blue-500 text-s">{f.name}</td>
            <td className="py-2 text-s">
              <span className="px-1.5 py-0.5 bg-dark-border rounded text-dark-muted">{f.type}</span>
            </td>
            <td className="py-2 text-dark-muted text-s">{f.description}</td>
            {showRequired && (
              <td className="py-2 text-s">
                {f.required ? (
                  <span className="font-medium text-dark-muted">Có</span>
                ) : (
                  <span className="text-dark-muted">Không</span>
                )}
              </td>
            )}
            <td className="py-2 font-mono text-dark-muted text-s">{f.example}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
