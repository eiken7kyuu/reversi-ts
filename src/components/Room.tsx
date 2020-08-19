import React, { useState } from 'react';
import './room.scss';
import { initBoard } from '../reversi';
import { RoomInfo, createId, createRoomId } from '../multiPlay';
import { getUid, firebaseAuth } from '../auth';
import { setMyInfo, getRoomInfo, setRoomInfo } from '../repository';

type RoomProps = {
  doSync: (roomId: string, myId: string) => void;
}

function generateGuestId(hostId: string) {
  for (let i = 0; i < 2; i++) {
    const guestId = createId();
    if (guestId !== hostId) return guestId;
  }
}

const Room: React.FC<RoomProps> = ({ doSync }) => {
  const [inputRoomId, setInputRoomId] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);

  function errorHandle(message: string) {
    alert(message);
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
      status: '',
      pass: ''
    }

    await setMyInfo(await getUid(), roomId);
    await setRoomInfo(roomId, newRoomInfo);
    doSync(roomId, myId);
  }

  async function enterRoom() {
    setButtonDisabled(true);
    await firebaseAuth();

    // 部屋idの入力チェック
    if (inputRoomId === '') {
      errorHandle('idを入力してください');
      return;
    }

    const roomId = inputRoomId;
    const roomInfo = await getRoomInfo(inputRoomId);
    if (!roomInfo) {
      errorHandle('入力された部屋idは存在しません');
      return;
    }

    if (roomInfo.guest !== '') {
      errorHandle('この部屋はすでに人がいます');
      return;
    }

    const guestId = generateGuestId(roomInfo.host);
    if (!guestId) {
      errorHandle('しばらくしてからもう一度お試しください');
      return;
    }

    roomInfo.guest = guestId;
    roomInfo.turn = roomInfo.host;
    roomInfo.status = 'running';
    await setMyInfo(await getUid(), roomId);
    await setRoomInfo(roomId, roomInfo);

    doSync(roomId, roomInfo.guest);
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