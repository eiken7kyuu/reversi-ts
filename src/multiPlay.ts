import { Disk, initBoard } from './reversi';

export type Data = {
  roomId: string;
  myId: string;
  roomInfo: RoomInfo;
}

// 同期データ 部屋情報
export type RoomInfo = {
  host: string;
  guest: string;
  turn: string, // 'none' or 8桁の文字列
  board: Disk[][],
  status: 'waiting' | 'running' | 'end'
}

export function initData(): Data {
  return {
    roomId: '',
    myId: '',
    roomInfo: {
      host: '',
      guest: '',
      turn: 'none',
      board: initBoard(),
      status: 'waiting',
    },
  };
}

export function createId() {
  return String(Math.random()).substr(2, 8);
}

export function createRoomId() {
  return createId().slice(0, 4);
}