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
  response: Response
): Promise<ApiResponse<T>> => {
  const isJsonResponse = response.headers
    .get("content-type")
    ?.includes("application/json");
  if (response.status === 404) {
    toast.error("Not Found", {
      style: { background: "#e94625" },
    });
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

    toast.error(errorMessage, {
      style: { background: "#e94625" },
    });
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

const handleError = (error: any): ApiResponse<never> => {
  const errorMessage = error.message || "An error occurred";
  if (error.name !== "AbortError") {
    toast.error(errorMessage, {
      style: { background: "#e94625" },
    });
  }
  console.error("API call failed:", errorMessage);

  return {
    success: false,
    status: 0, // Indicate that this is a client-side error without a response status
    error: errorMessage,
  };
};

const api = {
  setAuthToken, // Add setAuthToken method to the api object

  request: async <T>(
    url: string,
    method: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const headers = new Headers(options.headers);

      // Automatically set Content-Type to application/json if body is not FormData
      if (options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
        options.body = JSON.stringify(options.body);
      }

      // Set Authorization header if authToken is available
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
      }

      const response = await fetch(url, {
        method,
        ...options,
        credentials: "include",
        next: { revalidate: 10 },
        headers,
      });

      return await handleResponse<T>(response);
    } catch (error: any) {
      return handleError(error);
    }
  },

  get: async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    return api.request<T>(url, "GET", options);
  },

  post: async <T>(
    url: string,
    data: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    return api.request<T>(url, "POST", {
      ...options,
      body: data,
    });
  },

  put: async <T>(
    url: string,
    data: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    return api.request<T>(url, "PUT", {
      ...options,
      body: data,
    });
  },

  delete: async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    return api.request<T>(url, "DELETE", options);
  },
};

export default api;
