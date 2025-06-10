import { env } from './env';

interface ApiConfig {
  baseUrl: string;
}

class ApiService {
  private baseUrl: string;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
  }

  async analyzeBoardImage(file: File, height: number, length: number): Promise<Response> {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${this.baseUrl}/wooden_boards_volume_seg/?height=${height}&length=${length}`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response;
  }
}

export const api = new ApiService({
  baseUrl: env.VITE_API_URL,
});