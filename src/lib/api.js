import axios from 'axios';

// 從環境變數讀取您的 TDX API 憑證
const AppID = process.env.NEXT_PUBLIC_TDX_CLIENT_ID;
const AppKey = process.env.NEXT_PUBLIC_TDX_CLIENT_SECRET;

// 用於快取 access token，避免重複申請
let cachedToken = {
  accessToken: null,
  expiresAt: 0, // Token 的過期時間 (timestamp in milliseconds)
};

/**
 * 取得 TDX API 的 Access Token
 * 此函式會處理 token 的快取，只有在 token 不存在或即將過期時，才會重新申請。
 */
async function getAccessToken() {
  // 檢查憑證是否存在
  if (!AppID || !AppKey) {
    throw new Error('TDX API credentials (TDX_CLIENT_ID, TDX_CLIENT_SECRET) are not properly configured in environment variables.');
  }

  const now = Date.now();
  // 如果快取的 token 仍然有效 (我們設定在過期前 1 分鐘就更新，以防萬一)
  if (cachedToken.accessToken && now < cachedToken.expiresAt - 60000) {
    console.log('Using cached TDX access token.');
    return cachedToken.accessToken;
  }

  console.log('Requesting new TDX access token...');
  const authUrl = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', AppID);
  params.append('client_secret', AppKey);

  try {
    const response = await axios.post(authUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, expires_in } = response.data;
    
    // 更新快取
    cachedToken = {
      accessToken: access_token,
      // 計算 token 的絕對過期時間
      expiresAt: now + expires_in * 1000,
    };
    
    console.log('Successfully obtained new TDX access token.');
    return access_token;

  } catch (error) {
    // 處理 axios 的錯誤物件
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Failed to get access token:', errorMessage);
    throw new Error(`Failed to get TDX access token: ${errorMessage}`);
  }
}

/**
 * 獲取特定車站的即時列車動態
 * @param {string} stationId - 車站代碼
 * @returns {Promise<Object>} API 回傳的資料
 */
export const fetchTrainStationData = async (stationId) => {
  try {
    // 1. 取得 Access Token (會自動處理快取)
    const accessToken = await getAccessToken();

    // 2. 準備 API 請求
    const apiUrl = `https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/GeneralStationTimetable/Station/${stationId}?%24format=JSON`;
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br', // 讓 axios 處理解壓縮
    };

    console.log('Fetching train station data with Authorization header...');
    
    // 3. 發送 API 請求
    const response = await axios.get(apiUrl, { headers });

    // axios 在收到非 2xx 回應時會自動拋出錯誤，所以不用像 fetch 一樣手動檢查 response.ok
    console.log('Successfully fetched train station data.');
    return response.data; // axios 會自動解析 JSON

  } catch (error) {
    const errorMessage = error.response ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : error.message;
    console.error('Error fetching train station data:', errorMessage);
    // 重新拋出錯誤，讓呼叫此函式的地方可以捕捉到
    throw error;
  }
};