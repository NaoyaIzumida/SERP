import axios, { AxiosResponse } from 'axios';

// ベースURLの設定
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL, // 環境変数からベースURLを読み込む
  headers: {
    'Content-Type': 'application/json',
  },
});

// APIからデータを取得する関数の例
export const fetchData = async <T>(endpoint: string): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// APIにデータを送信する関数の例
export const postData = async <T>(endpoint: string, data: T): Promise<void> => {
  try {
    await apiClient.post(endpoint, data);
  } catch (error) {
    console.error('API post error:', error);
    throw error;
  }
};