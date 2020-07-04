import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './reset.css';
import './style.scss';
import Room from './components/Room';
import Game from './components/Game';
import { Data, RoomInfo, initData } from './multiPlay';
import { listener } from './repository';

const App: React.FC = () => {
  const [view, setView] = useState<'room' | 'gameMulti'>('room');
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

  return (
    <div>
      <Room view={view} changeView={() => setView('gameMulti')} doSync={doSync} />
      <Game view={view} data={data} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));