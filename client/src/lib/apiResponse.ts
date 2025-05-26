
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export class ApiResponseHandler {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message
    };
  }

  static error(message: string, details?: any): ApiResponse {
    return {
      success: false,
      error: message,
      details
    };
  }

  static handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }
    
    if (response.status === 204) {
      return Promise.resolve(this.success(null as T));
    }

    return response.json().then(data => this.success(data));
  }
}

export { ApiResponseHandler as ApiResponse };
