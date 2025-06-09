async function hmacSHA1(text, key) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(text);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function getAuthorizationHeader() {
  const AppID = process.env.TDX_CLIENT_ID;
  const AppKey = process.env.TDX_CLIENT_SECRET;

  if (!AppID || !AppKey) {
    throw new Error('TDX API credentials are not properly configured');
  }

  const GMTString = new Date().toGMTString();
  const SignDate = `x-date: ${GMTString}`;
  console.log('SignDate:', SignDate);  // 添加日誌
  
  const hmac = await hmacSHA1(SignDate, AppKey);
  console.log('HMAC:', hmac);  // 添加日誌
  
  const Authorization = `hmac username="${AppID}",algorithm="hmac-sha1",headers="x-date",signature="${hmac}"`;
  console.log('Authorization:', Authorization);  // 添加日誌
  
  return {
    'Authorization': Authorization,
    'X-Date': GMTString,
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip'
  };
};

export const fetchTrainStationData = async () => {
  try {
    const headers = await getAuthorizationHeader();
    console.log('Request headers:', headers);  // 添加日誌用於調試
    const response = await fetch(
      'https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/LiveBoard/Station/TPE?%24top=30&%24format=JSON',
      {
        headers: headers,
        method: 'GET'  // 明確指定請求方法
      }
    );
    console.log('Response status:', response.status);  // 添加日誌用於調試

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching train station data:', error);
    throw error;
  }
};
