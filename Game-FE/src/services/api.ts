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

export const categoryAPI = {
  getAll: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = "name",
    sortOrder: string = "asc"
  ): Promise<{
    content: any[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    lastPage: boolean;
  }> => {
    try {
      const url = `/public/categories?pageNumber=${page}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      console.log("Request URL:", url);

      const response = await axiosInstance.get(url);
      console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get categories failed:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(`/public/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get category failed:", error);
      throw error;
    }
  },

  create: async (data: { name: string }): Promise<any> => {
    try {
      const response = await axiosInstance.post("/admin/categories", data);
      return response.data;
    } catch (error) {
      console.error("Create category failed:", error);
      throw error;
    }
  },

  update: async (id: number, data: { name: string }): Promise<any> => {
    try {
      const response = await axiosInstance.put(`/admin/categories`, {
        categoryId: id,
        ...data,
      });
      return response.data;
    } catch (error) {
      console.error("Update category failed:", error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/admin/categories/${id}`);
    } catch (error) {
      console.error("Delete category failed:", error);
      throw error;
    }
  },
};
export const gameAPI = {
  getAll: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = "keyId",
    sortOrder: string = "asc",
    filters: {
      keyId?: string;
      gameName?: string;
      categoryId?: number;
      defaultLanguage?: string;
    } = {}
  ): Promise<{
    content: any[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    lastPage: boolean;
  }> => {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: size.toString(),
        sortBy,
        sortOrder,
      });

      // Add filters to query parameters
      if (filters.keyId) params.append("keyId", filters.keyId);
      if (filters.gameName) params.append("gameName", filters.gameName);
      if (filters.categoryId)
        params.append("categoryId", filters.categoryId.toString());
      if (filters.defaultLanguage)
        params.append("defaultLanguage", filters.defaultLanguage);

      const url = `/public/games?${params.toString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Get games failed:", error);
      throw error;
    }
  },

  getById: async (id: number): Promise<any> => {
    try {
      const response = await axiosInstance.get(`/public/games/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get game by ID failed:", error);
      throw error;
    }
  },

  create: async (data: {
    keyId: string;
    categoryId: number;
    defaultLanguage: string;
    gameNames: { language: string; value: string }[];
  }): Promise<any> => {
    const dataNew = {
      category: { categoryId: data.categoryId },
      ...data,
    };
    try {
      const response = await axiosInstance.post("/admin/games", dataNew);
      return response.data;
    } catch (error) {
      console.error("Create game failed:", error);
      throw error;
    }
  },

  update: async (
    id: number,
    data: {
      keyId: string;
      categoryId: number;
      defaultLanguage: string;
      gameNames: { language: string; value: string }[];
    }
  ): Promise<any> => {
    const dataNew = {
      category: { categoryId: data.categoryId },
      ...data,
    };
    try {
      const response = await axiosInstance.put(`/admin/games`, {
        gameId: id,
        ...dataNew,
      });
      return response.data;
    } catch (error) {
      console.error("Update game failed:", error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/admin/games/${id}`);
    } catch (error) {
      console.error("Delete game failed:", error);
      throw error;
    }
  },
};
