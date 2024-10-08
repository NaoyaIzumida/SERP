import axios from 'axios';

// ベースURLを環境変数から取得
const BASE_URL = process.env.REACT_APP_BASE_URL;

// APIリクエストの関数
export const fetchSearchResults = async (query: string): Promise<any> => {
    try {
        const response = await axios.get(`${BASE_URL}/filelist/202409`, {
            params: { q: query },
        });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching data');
    }
};