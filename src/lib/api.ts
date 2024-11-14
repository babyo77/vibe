import { toast } from "sonner";

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data?: T;
  error?: string;
}

let authToken: string | null = null; // Variable to store the auth token

const setAuthToken = (token: string | null) => {
  authToken = token;
};

const handleResponse = async <T>(
  response: Response,
  showErrorToast: boolean
): Promise<ApiResponse<T>> => {
  const isJsonResponse = response.headers
    .get("content-type")
    ?.includes("application/json");

  if (response.status === 404) {
    if (showErrorToast) {
      toast.error("Not Found", {
        style: { background: "#e94625" },
      });
    }
    return {
      success: false,
      status: response.status,
      error: "Page not found",
    };
  }

  if (!response.ok) {
    const error = isJsonResponse
      ? await response.json()
      : await response.text();
    const errorMessage =
      typeof error === "string"
        ? error
        : error.message
        ? error.message
        : error.meta?.msg
        ? error.meta.msg
        : error.msg
        ? error.msg
        : "Something went wrong";

    if (showErrorToast) {
      toast.error(errorMessage, {
        style: { background: "#e94625" },
      });
    }
    console.error("API call failed:", errorMessage);

    return {
      success: false,
      status: response.status,
      error: errorMessage,
    };
  }

  const data = isJsonResponse ? await response.json() : await response.text();

  return {
    success: true,
    status: response.status,
    data,
  };
};

const handleError = (
  error: any,
  showErrorToast: boolean
): ApiResponse<never> => {
  const errorMessage = error.message || "An error occurred";
  if (error.name !== "AbortError" && showErrorToast) {
    toast.error(errorMessage, {
      style: { background: "#e94625" },
    });
  }
  console.error("API call failed:", errorMessage);

  return {
    success: false,
    status: 0, // Indicate that this is a client-side error without a response status
    error: error.name == "AbortError" ? "" : errorMessage,
  };
};

const api = {
  setAuthToken, // Add setAuthToken method to the api object

  request: async <T>(
    url: string,
    method: string,
    options: RequestInit & { showErrorToast?: boolean } = {}
  ): Promise<ApiResponse<T>> => {
    const { showErrorToast = true, ...fetchOptions } = options;

    try {
      const headers = new Headers(fetchOptions.headers);

      // Automatically set Content-Type to application/json if body is not FormData
      if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
        fetchOptions.body = JSON.stringify(fetchOptions.body);
      }

      // Set Authorization header if authToken is available
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
      }

      const response = await fetch(url, {
        method,
        ...fetchOptions,
        credentials: "include",
        next: { revalidate: 10 },
        headers,
      });

      return await handleResponse<T>(response, showErrorToast);
    } catch (error: any) {
      return handleError(error, showErrorToast);
    }
  },

  get: async <T>(
    url: string,
    options: RequestInit & { showErrorToast?: boolean } = {}
  ): Promise<ApiResponse<T>> => {
    return api.request<T>(url, "GET", options);
  },

  post: async <T>(
    url: string,
    data: any,
    options: RequestInit & { showErrorToast?: boolean } = {}
  ): Promise<ApiResponse<T>> => {
    return api.request<T>(url, "POST", {
      ...options,
      body: data,
    });
  },

  put: async <T>(
    url: string,
    data: any,
    options: RequestInit & { showErrorToast?: boolean } = {}
  ): Promise<ApiResponse<T>> => {
    return api.request<T>(url, "PUT", {
      ...options,
      body: data,
    });
  },

  delete: async <T>(
    url: string,
    options: RequestInit & { showErrorToast?: boolean } = {}
  ): Promise<ApiResponse<T>> => {
    return api.request<T>(url, "DELETE", options);
  },
};

export default api;
