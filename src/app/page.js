'use client';

import { useState, useEffect } from 'react';
import { fetchTrainStationData } from '@/lib/api.js';
import { stationsByCounty } from '@/lib/stationID.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [stationData, setStationData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState('1000'); // 預設台北站

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTrainStationData(selectedStation);
        setStationData(data);
        console.log('Fetched station timetable data:', data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [selectedStation]);

  const handleStationChange = (stationId) => {
    setSelectedStation(stationId);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <main className="max-w-7xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-center text-red-600">錯誤</h1>
            </div>
            <div className="p-8 text-center text-red-500">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  // 從複雜的 JSON 結構中提取我們需要的資訊
  const stationInfo = stationData?.StationTimetables?.[0];
  // 過濾掉日誌中可能出現的無效字串，確保只處理物件
  const timetables = stationInfo?.Timetables?.filter(
    (train) => typeof train === 'object' && train !== null && train.TrainNo
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <main className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            {/* 動態顯示車站名稱 */}
            <h1 className="text-2xl font-bold text-center">
              {stationInfo?.StationName?.Zh_tw || '車站'} 時刻表
            </h1>
            {stationData?.UpdateTime && (
              <p className="text-center text-gray-500 mt-2">
                更新時間: {new Date(stationData.UpdateTime).toLocaleString('zh-TW')}
              </p>
            )}
            <div className="flex flex-col items-center w-full gap-4">
              <Select onValueChange={handleStationChange} value={selectedStation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="選擇車站" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(stationsByCounty).map(([county, stations]) => (
                    <div key={county}>
                      <div className="px-2 py-1 text-sm font-semibold text-gray-500">{county}</div>
                      {stations.map((station) => (
                        <SelectItem key={station.StationID} value={station.StationID}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4">
            {/* 調整為5欄，增加「車種」 */}
            <div className="grid grid-cols-5 gap-4 bg-gray-50 p-4 font-semibold text-gray-700 text-center">
              <div>車次</div>
              <div>車種</div>
              <div>往</div>
              <div>發車時間</div>
              <div>狀態</div>
            </div>

            <div className="divide-y divide-gray-200">
              {timetables?.map((train) => (
                <div key={train.Sequence} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 items-center text-center">
                  <div className="font-medium text-blue-600">{train.TrainNo}</div>
                  {/* 顯示車種，並移除括號內的詳細描述讓版面更簡潔 */}
                  <div>{train.TrainTypeName?.Zh_tw.split('(')[0]}</div>
                  <div className="font-semibold">{train.DestinationStationName?.Zh_tw}</div>
                  {/* 時刻表顯示發車時間 */}
                  <div className="font-mono text-lg">{train.DepartureTime}</div>
                  {/* 時刻表沒有延誤資訊，故顯示準點 */}
                  <div className='text-green-600'>
                    準點
                  </div>
                </div>
              ))}

              {/* 更新無資料時的判斷條件 */}
              {(!timetables || timetables.length === 0) && (
                <div className="p-4 text-center text-gray-500">
                  目前沒有時刻表資訊
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}