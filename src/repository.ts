import firebase, { database } from 'firebase/app';
import 'firebase/database';
import { RoomInfo } from './multiPlay';


const roomPath = (roomId: string) => firebase.database().ref(`rooms/${roomId}`);

export async function setMyInfo(uid: string, roomId: string) {
  await firebase.database()
          .ref(['users', uid, 'rooms', roomId].join('/'))
          .set(true);
}

export async function getRoomInfo(roomId: string): Promise<RoomInfo | null> {
  const ref = roomPath(roomId);
  const snapshot = await ref.once('value');
  if (snapshot.val()) {
    return snapshot.val();
  }

  return null;
}

export async function setRoomInfo(roomId: string, roomInfo: RoomInfo) {
  const ref = roomPath(roomId);
  return await ref.set(roomInfo);
}

export async function listener(roomId: string, callBack: (roomInfo: RoomInfo) => void) {
  const ref = roomPath(roomId);
  await ref.on('value', (snapshot: database.DataSnapshot) => {
    const roomInfo: RoomInfo = snapshot.val();
    callBack(roomInfo)
  });
}