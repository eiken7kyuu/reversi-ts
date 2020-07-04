import React, { useState } from 'react';
import './room.scss';
import { initBoard } from '../reversi';
import { RoomInfo, createId, createRoomId } from '../multiPlay';
import { getUid, firebaseAuth } from '../auth';
import { setMyInfo, getRoomInfo, setRoomInfo } from '../repository';

type RoomProps = {
  view: 'room' | 'gameMulti';
  changeView: () => void;
  doSync: (roomId: string, myId: string) => void;
}

const Room: React.FC<RoomProps> = ({ view, changeView, doSync }) => {
  if (view !== 'room') { return null; }

  const [inputRoomId, setInputRoomId] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);

  function enableButton() {
    setButtonDisabled(false);
  }

  async function createRoom() {
    setButtonDisabled(true);
    await firebaseAuth();

    const roomId = createRoomId();
    const roomInfo = await getRoomInfo(roomId);
 
    // 部屋idが被ったら再生成
    if (roomInfo) {
      await createRoom();
      return;
    }

    const myId = createId();
    const newRoomInfo: RoomInfo = {
      host: myId,
      guest: '',
      turn: 'none',
      board: initBoard(),
      status: 'waiting'
    }
  
    const uid = await getUid();
    await setMyInfo(uid, roomId);
    await setRoomInfo(roomId, newRoomInfo);
  
    // ルームのビューを消す
    changeView();
    doSync(roomId, myId);
  }

  async function enterRoom() {
    setButtonDisabled(true);
    await firebaseAuth();

    // 部屋idの入力チェック
    if (inputRoomId === '') {
      alert('idを入力してください');
      enableButton();
      return;
    }
  
    const roomId = inputRoomId;
    const roomInfo = await getRoomInfo(inputRoomId);
    if (!roomInfo) {
      alert('入力された部屋idは存在しません');
      enableButton();
      return;
    }

    if (roomInfo.guest !== '') {
      alert('この部屋はすでに人がいます');
      enableButton();
      return;
    }
  
    roomInfo.guest = createId();
    for (let i = 0; i < 2; i++) {
      if (roomInfo.guest !== roomInfo.host) break;
      roomInfo.guest = createId();
    }

    if (roomInfo.guest === roomInfo.host) {
      alert('しばらくしてからもう一度お試しください');
      return;
    }

    roomInfo.turn = roomInfo.host;
    roomInfo.status = 'running';
    const uid = await getUid();
    await setMyInfo(uid, roomId);
    await setRoomInfo(roomId, roomInfo);

    // ルームのビューを消す
    changeView();
    doSync(roomId, roomInfo.guest);
    enableButton();
  }

  return (
    <div className="room">
      <h2 className="title">オンライン対戦 オセロ</h2>

      <div className="create">
        <input type="button" id="createRoomButton" className="create-room-button" onClick={createRoom} disabled={buttonDisabled} value="部屋を作る" />
      </div>

      <div className="enter">
        <input type="text" id="roomId" className="room-id-text" onChange={event => setInputRoomId(event.target.value)} placeholder="部屋ID" />
        <input type="button" id="enterRoomButton" className="enter-room-button" onClick={enterRoom} disabled={buttonDisabled} value="部屋に入る" />
      </div>
    </div>
  );
};

export default Room;