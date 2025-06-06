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

  const GMTString = new Date().toGMTString();
  const hmac = await hmacSHA1(`x-date: ${GMTString}`, AppKey);
  
  const Authorization = `hmac username="${AppID}", algorithm="hmac-sha1", headers="x-date", signature="${hmac}"`;

  return {
    Authorization: Authorization,
    'X-Date': GMTString,
  };
};

export const fetchTrainStationData = async () => {
  try {
    const headers = await getAuthorizationHeader();
    const response = await fetch(
      'https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/GeneralTrainTimetable?%24top=30&%24format=JSON', // 台北車站
      {
        headers: headers,
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching train station data:', error);
    throw error;
  }
};
