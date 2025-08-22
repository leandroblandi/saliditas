export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface FileResponse {
  file: any;
  fileName: string;
}
