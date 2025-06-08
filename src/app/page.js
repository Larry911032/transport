import { fetchTrainStationData } from '@/models/tdxApi.mjs';

export default async function Home() {
  let stationData;
  let error = null;

  try {
    stationData = await fetchTrainStationData();
  } catch (err) {
    error = err.message;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <main className="max-w-7xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-center text-red-600">錯誤</h1>
            </div>
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <main className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-center">台北車站</h1>
            <p className="text-center text-gray-500 mt-2">即時列車資訊</p>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 font-semibold text-gray-700">
              <div>車次</div>
              <div>往</div>
              <div>時間</div>
              <div>狀態</div>
            </div>

            <div className="divide-y divide-gray-200">
              {stationData?.StationLiveBoards?.map((train) => (
                <div key={train.TrainNo} className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50">
                  <div className="font-medium">{train.TrainNo}</div>
                  <div>{train.EndingStationName?.Zh_tw}</div>
                  <div>{new Date(train.ScheduleArrivalTime).toLocaleTimeString('zh-TW')}</div>
                  <div className={train.DelayTime > 0 ? 'text-red-600' : 'text-green-600'}>
                    {train.DelayTime > 0 ? `延誤 ${train.DelayTime} 分鐘` : '準點'}
                  </div>
                </div>
              ))}

              {(!stationData?.StationLiveBoards || stationData.StationLiveBoards.length === 0) && (
                <div className="p-4 text-center text-gray-500">
                  目前沒有列車資訊
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
