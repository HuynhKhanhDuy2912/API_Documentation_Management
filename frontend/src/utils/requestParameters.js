const PATH_PARAMETER_PATTERN = /(?:\/:([A-Za-z_][A-Za-z0-9_]*)|\{([A-Za-z_][A-Za-z0-9_]*)\})/g;

export function getPathParameterNames(url = '') {
  const names = new Set();
  const pattern = new RegExp(PATH_PARAMETER_PATTERN.source, 'g');
  const routePath = String(url).split(/[?#]/, 1)[0];

  for (const match of routePath.matchAll(pattern)) {
    names.add(match[1] || match[2]);
  }

  return names;
}

export function resolveRequestParameterLocation(parameter, url = '') {
  if (parameter?.in === 'path' || parameter?.in === 'query') {
    return parameter.in;
  }

  return getPathParameterNames(url).has(parameter?.name) ? 'path' : 'query';
}

export function normalizeRequestParams(parameters = [], url = '') {
  return parameters.map((parameter) => {
    const normalizedParameter = parameter || {};
    const name = String(normalizedParameter.name || '').trim();
    const location = resolveRequestParameterLocation({ ...normalizedParameter, name }, url);

    return {
      ...normalizedParameter,
      name,
      in: location,
      required: location === 'path' ? true : Boolean(normalizedParameter.required),
    };
  });
}

export function normalizeEndpointPath(endpoint = '') {
  return String(endpoint).replace(/\/:([A-Za-z_][A-Za-z0-9_]*)/g, '/{$1}');
}

export function joinBaseUrl(baseUrl = '', endpoint = '') {
  if (!endpoint) return baseUrl;
  const normalizedEndpoint = normalizeEndpointPath(endpoint);
  if (/^https?:\/\//i.test(normalizedEndpoint) || !baseUrl) return normalizedEndpoint;

  return `${baseUrl.replace(/\/+$/, '')}/${normalizedEndpoint.replace(/^\/+/, '')}`;
}

export function buildSampleRequestUrl(baseUrl, endpoint, parameters = []) {
  const normalizedParams = normalizeRequestParams(parameters, endpoint);
  const endpointParts = String(endpoint || '').match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  let path = endpointParts?.[1] || '';
  const searchParams = new URLSearchParams(endpointParts?.[2]?.slice(1) || '');
  const hash = endpointParts?.[3] || '';
  const pathExamples = new Map(
    normalizedParams
      .filter((parameter) => parameter.in === 'path' && parameter.example)
      .map((parameter) => [parameter.name, String(parameter.example)])
  );

  path = path.replace(
    /(?:\/:([A-Za-z_][A-Za-z0-9_]*)|\{([A-Za-z_][A-Za-z0-9_]*)\})/g,
    (placeholder, colonName, braceName) => {
      const name = colonName || braceName;
      const example = pathExamples.get(name);
      if (example === undefined) return placeholder;

      const encodedExample = encodeURIComponent(example);
      return colonName ? `/${encodedExample}` : encodedExample;
    }
  );

  normalizedParams
    .filter((parameter) => parameter.in === 'query'
      && parameter.example !== undefined
      && parameter.example !== null
      && String(parameter.example).trim() !== '')
    .forEach((parameter) => {
      searchParams.set(parameter.name, String(parameter.example));
    });

  const query = searchParams.toString();
  return `${joinBaseUrl(baseUrl, path)}${query ? `?${query}` : ''}${hash}`;
}
