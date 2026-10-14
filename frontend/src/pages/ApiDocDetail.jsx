import MethodBadge from '../components/MethodBadge';

export default function ApiDocDetail({ doc, baseUrl }) {
  const fullUrl = baseUrl ? baseUrl + doc.url : doc.url;

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
      </div>

      {/* Tên + Mô tả */}
      <div>
        <h3 className="text-base font-semibold text-dark-text">{doc.name}</h3>
        {doc.description && (
          <p className="text-sm text-dark-muted mt-1">{doc.description}</p>
        )}
      </div>

      {/* Headers */}
      {doc.headers?.length > 0 && (
        <DetailSection title="Headers">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-dark-muted border-b border-dark-border">
                <th className="pb-2 font-medium">Key</th>
                <th className="pb-2 font-medium">Value</th>
                <th className="pb-2 font-medium">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {doc.headers.map((h, i) => (
                <tr key={i} className="border-b border-dark-border/50">
                  <td className="py-2 font-mono text-primary text-xs">{h.key}</td>
                  <td className="py-2 text-dark-text text-xs">{h.value}</td>
                  <td className="py-2 text-dark-muted text-xs">{h.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetailSection>
      )}

      {/* Request Parameters */}
      {doc.requestParams?.length > 0 && (
        <DetailSection title="Request Parameters">
          <FieldTable fields={doc.requestParams} showRequired />
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
        <span className="w-1 h-4 bg-primary rounded-full" />
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
        <tr className="text-left text-xs text-dark-muted border-b border-dark-border">
          <th className="pb-2 font-medium">Tên</th>
          <th className="pb-2 font-medium">Kiểu</th>
          <th className="pb-2 font-medium">Mô tả</th>
          {showRequired && <th className="pb-2 font-medium">Bắt buộc</th>}
          <th className="pb-2 font-medium">Ví dụ</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((f, i) => (
          <tr key={i} className="border-b border-dark-border/50">
            <td className="py-2 font-mono text-primary text-xs">{f.name}</td>
            <td className="py-2 text-xs">
              <span className="px-1.5 py-0.5 bg-dark-border rounded text-dark-text">{f.type}</span>
            </td>
            <td className="py-2 text-dark-muted text-xs">{f.description}</td>
            {showRequired && (
              <td className="py-2 text-xs">
                {f.required ? (
                  <span className="text-delete font-medium">Có</span>
                ) : (
                  <span className="text-dark-muted">Không</span>
                )}
              </td>
            )}
            <td className="py-2 font-mono text-dark-muted text-xs">{f.example}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
