import axios from 'axios';
import { msalInstance } from '../msalInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// リクエストインターセプターを設定
apiClient.interceptors.request.use(async (config) => {
  try {
    await msalInstance.initialize();

    // サイレントでトークン取得
    const account = msalInstance.getActiveAccount();
    if (!account) throw new Error('No active account!');

    const tokenRequest = {
      scopes: [`api://${import.meta.env.VITE_API_SCOPE_ID}/${import.meta.env.VITE_API_SCOPE_NAME}`],
      account,
    };

    const response = await msalInstance.acquireTokenSilent({
      ...tokenRequest,
      account,
    });

    // トークンをAuthorizationヘッダーにセット
    config.headers['Authorization'] = `Bearer ${response.accessToken}`;
  } catch (error) {
    console.error('Failed to acquire token silently:', error);
    // 必要に応じてリダイレクトや再ログインの処理もここで行う
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
