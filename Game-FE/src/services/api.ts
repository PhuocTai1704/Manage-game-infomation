import axiosInstance from "./axiosInstance";

export const API_URL = import.meta.env.VITE_API_URL;
export const API_IMAGE = `${API_URL}/public/file/`;

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
}

interface AuthResponse {
  accessToken: string;
  message: string;
  user: {
    userId: string;
    fullName: string;
  };
}

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      const accessToken = response.data.accessToken;

      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  },
};

export const httpClient = {
  get: <T = any>(url: string): Promise<T> => {
    return axiosInstance
      .get(url)
      .then((response) => response.data)
      .catch((error) => {
        console.error("GET request failed:", error);
        throw error;
      });
  },

  post: <T = any>(url: string, data?: any): Promise<T> => {
    return axiosInstance
      .post(url, data)
      .then((response) => response.data)
      .catch((error) => {
        console.error("POST request failed:", error);
        throw error;
      });
  },

  put: <T = any>(url: string, data?: any): Promise<T> => {
    return axiosInstance
      .put(url, data)
      .then((response) => response.data)
      .catch((error) => {
        console.error("PUT request failed:", error);
        throw error;
      });
  },

  delete: <T = any>(url: string): Promise<T> => {
    return axiosInstance
      .delete(url)
      .then((response) => response.data)
      .catch((error) => {
        console.error("DELETE request failed:", error);
        throw error;
      });
  },
};
