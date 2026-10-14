export default function MethodBadge({ method }) {
  const colorMap = {
    GET: 'bg-get/20 text-get',
    POST: 'bg-post/20 text-post',
    PUT: 'bg-put/20 text-put',
    PATCH: 'bg-patch/20 text-patch',
    DELETE: 'bg-delete/20 text-delete',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${colorMap[method] || 'bg-gray-500/20 text-gray-400'}`}>
      {method}
    </span>
  );
}
