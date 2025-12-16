const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Derive the API base URL from environment variables.
 * Priority:
 * - REACT_APP_API_BASE
 * - REACT_APP_BACKEND_URL
 * Falls back to same origin "" so relative URLs work in dev when proxied.
 */
// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Get API base URL from env vars. */
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";
  // Trim trailing slash for consistency
  return base.replace(/\/+$/, "");
}

/**
 * Internal helper to build a full URL for an endpoint.
 */
function buildUrl(path) {
  const base = getApiBaseUrl();
  // Ensure path starts with slash
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * Fetch wrapper with:
 * - JSON request/response handling
 * - AbortController-based timeout
 * - Consistent error objects
 * - Optional custom headers
 */
// PUBLIC_INTERFACE
export async function apiFetch(path, options = {}) {
  /** Perform a fetch request with timeout and JSON handling. */
  const {
    method = "GET",
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT_MS,
    signal: externalSignal,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error("Request timeout")), timeout);

  // Allow consumer to pass a signal; if provided, abort both when external aborts
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  const finalHeaders = {
    "Accept": "application/json",
    ...(body && typeof body === "object" && !(body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...headers,
  };

  const finalBody =
    body && typeof body === "object" && !(body instanceof FormData)
      ? JSON.stringify(body)
      : body;

  const url = buildUrl(path);
  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      signal: controller.signal,
      credentials: "include",
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    let data = null;
    if (isJson) {
      try {
        data = await res.json();
      } catch (e) {
        // fall back to text if JSON parsing fails
        data = null;
      }
    } else {
      // for non-json, try text
      try {
        data = await res.text();
      } catch (e) {
        data = null;
      }
    }

    if (!res.ok) {
      const error = new Error(`API error: ${res.status} ${res.statusText}`);
      error.status = res.status;
      error.statusText = res.statusText;
      error.data = data;
      error.url = url;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    // Normalize abort/timeout errors
    if (err?.name === "AbortError") {
      const e = new Error("Request aborted or timed out");
      e.isTimeout = true;
      e.cause = err;
      e.url = url;
      throw e;
    }
    err.url = url;
    throw err;
  }
}

/**
 * Tasks API surface
 * Endpoints assumed:
 * - GET /api/tasks
 * - POST /api/tasks
 * - PUT /api/tasks/:id
 * - DELETE /api/tasks/:id
 */
// PUBLIC_INTERFACE
export const tasksApi = {
  /** List tasks */
  async list() {
    return apiFetch("/api/tasks", { method: "GET" });
  },
  /** Create a task */
  async create(task) {
    return apiFetch("/api/tasks", { method: "POST", body: task });
  },
  /** Update a task by id */
  async update(id, updates) {
    return apiFetch(`/api/tasks/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: updates,
    });
  },
  /** Delete a task by id */
  async remove(id) {
    return apiFetch(`/api/tasks/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
