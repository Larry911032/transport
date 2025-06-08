async function getAuthorizationHeader() {
  const AppID = process.env.TDX_CLIENT_ID;
  const AppKey = process.env.TDX_CLIENT_SECRET;

  if (!AppID || !AppKey) {
    throw new Error('TDX API credentials are not properly configured');
  }

  return {
    'Authorization': 'Bearer ' + AppKey,
    'Content-Type': 'application/json'
  };
};

export const fetchTrainStationData = async () => {
  try {
    const headers = await getAuthorizationHeader();
    const response = await fetch(
      'https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/LiveBoard/Station/TPE?%24top=30&%24format=JSON',
      {
        headers: headers,
      }
    );

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
