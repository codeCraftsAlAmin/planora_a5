import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// Get base URL consistent with api-service.ts
const BASE_URL =
  typeof window === "undefined"
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000"}/api/v1`
    : "/api/v1";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to track if the token is currently being refreshed
let isRefreshing = false;
// Queue to hold requests that are waiting for the token refresh
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 occurs and the request hasn't been retried yet
    // Exclude the refresh call itself from being retried to prevent infinite loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      if (isRefreshing) {
        // If already refreshing, add the request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the refresh token endpoint
        // Based on backend route: /auth/refresh-token
        await axiosInstance.post("/auth/refresh-token");

        // Resolve the queue with technical 'null' but conceptually the refresh succeeded
        processQueue(null);

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear queue, redirect to login, and reject
        processQueue(refreshError, null);

        // Clear local state by redirecting to login (hard reset)
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden globally
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
