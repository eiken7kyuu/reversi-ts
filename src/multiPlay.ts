import { initBoard, Board } from './reversi';

export type Data = {
  roomId: string;
  myId: string;
  roomInfo: RoomInfo;
}

export type Status = 'running' | 'end' | '';

// 同期データ 部屋情報
export type RoomInfo = {
  host: string;
  guest: string;
  turn: string, // 'none' or 8桁の文字列
  board: Board,
  status: Status,
  pass: string,
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
      status: '',
      pass: '',
    },
  };
}

export function createId() {
  return String(Math.random()).substr(2, 8);
}

export function createRoomId() {
  return createId().slice(0, 4);
}