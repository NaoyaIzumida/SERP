import axios from 'axios';

// ベースURLを環境変数から取得
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// axiosインスタンスを作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,          // タイムアウトを設定（オプション）
});

export default apiClient;