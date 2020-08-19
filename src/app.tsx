import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './reset.css';
import './style.scss';
import Room from './components/Room';
import Game from './components/Game';
import { Data, RoomInfo, initData } from './multiPlay';
import { listener } from './repository';

const App: React.FC = () => {
  const [data, setData] = useState<Data>(initData());

  // firebaseデータの同期を開始する処理
  // firebaseデータが更新されるごとにdataステートの値を更新させるようにする
  function doSync(roomId: string, myId: string) {
    const callBack = (roomInfo: RoomInfo) => {
      const data: Data = {
        roomId: roomId,
        myId: myId,
        roomInfo: roomInfo,
      };
      setData(data);
    }

    listener(roomId, callBack);
  }

  return (data.myId.length === 0
    ? <Room doSync={doSync} />
    : <Game data={data} />
  )
};

ReactDOM.render(<App />, document.getElementById('root'));