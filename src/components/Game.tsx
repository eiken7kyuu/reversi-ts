import React, { useEffect } from 'react';
import './game.scss';
import Square from './Square';
import { Data } from '../multiPlay';
import { setRoomInfo } from '../repository';
import {
  initBoard, Position, gameSet, canPut,
  getReverseList, reverse, pass, diskCount, BOARD_RANGE
} from '../reversi';
import Message from './Message';
import deepcopy from 'deepcopy';

type GameMultiProps = {
  data: Data;
}

const GameMulti: React.FC<GameMultiProps> = ({ data }) => {
  const newData = deepcopy(data); // dataのディープコピー
  const board = newData.roomInfo.board;

  const myTurn = data.myId === data.roomInfo.turn;
  const isHost = () => data.myId === data.roomInfo.host;
  const myDisk = () => isHost() ? 'Black' : 'White';
  const rivalId = () => isHost() ? data.roomInfo.guest : data.roomInfo.host;
  const colorInJapanese = (myDisk: 'Black' | 'White') => {
    return myDisk === 'Black' ? '黒' : '白';
  };

  useEffect(init, [data]);
  // レンダリングごとに実行
  function init() {
    // 自分のターンで、置く場所があるか判定
    // なければ相手のターンに変えて更新
    if (myTurn && pass(board, myDisk())) {
      newData.roomInfo.turn = rivalId();
      newData.roomInfo.pass = data.myId;
      setRoomInfo(newData.roomId, newData.roomInfo);
    }
  }

  function diskCountText() {
    const { whiteCount, blackCount } = diskCount(board);
    return `黒: ${blackCount} vs 白: ${whiteCount}`;
  }

  function turnText() {
    if (data.roomInfo.turn === 'none') return '';
    return data.roomInfo.turn === data.myId ? 'あなた' : '相手';
  }

  function resultText() {
    const { whiteCount, blackCount } = diskCount(board);

    const message = () => {
      const blackWin = blackCount > whiteCount;
      const whiteWin = whiteCount > blackCount;
      const youWin = (isHost() && blackWin) || (!isHost() && whiteWin);

      if (blackCount === whiteCount) return '引き分けです';
      return youWin ? 'あなたの勝ちです' : 'あなたの負けです';
    };

    return message();
  }

  function gameAgain() {
    newData.roomInfo.board = initBoard();
    newData.roomInfo.turn = data.roomInfo.host;
    newData.roomInfo.status = 'running';
    setRoomInfo(newData.roomId, newData.roomInfo);
  }

  // マスをクリックしたときに動作する関数を返す
  function clickHandle(pos: Position): () => void {
    return () => {
      if (!(myTurn && board[pos.y][pos.x] === 'None'))
        return;

      const reverseList = getReverseList(board, pos, myDisk());
      reverseList.push({ x: pos.x, y: pos.y });
      newData.roomInfo.board = reverse(board, reverseList, myDisk());
      newData.roomInfo.turn = rivalId();
      newData.roomInfo.pass = '';

      if (gameSet(newData.roomInfo.board)) {
        [newData.roomInfo.status, newData.roomInfo.turn] = ['end', 'none'];
      }

      setRoomInfo(newData.roomId, newData.roomInfo);
    };
  }

  function renderSquares() {
    const square = (pos: Position) => {
      // 自分のターンで何も置いてないところなら置ける場所か検証
      const exp = data.roomInfo.turn === data.myId && board[pos.y][pos.x] === 'None';
      const cannotPut = exp ? !canPut(board, pos, myDisk()) : false;

      return (<Square
        key={`${pos.y}${pos.x}`}
        clickHandle={clickHandle(pos)}
        disk={board[pos.y][pos.x]}
        cannotPut={cannotPut}
      />);
    }

    return BOARD_RANGE.flatMap(y => BOARD_RANGE.map(x => square({ x: x, y: y })));
  }

  function renderMessage() {
    if (data.roomInfo.status === 'end') {
      return (<Message message={resultText()} />);
    }

    const pass = data.roomInfo.pass !== '';
    const myId = data.roomInfo.pass === data.myId;
    if (pass && myId) {
      return (<Message message="あなたは置く場所がないのでパスしました" />);
    } else if (pass && !myId) {
      return (<Message message="相手は置ける場所がありません" />);
    }
  }

  return (
    <div className="container">
      <h2 className="room-id">ルーム: {data.roomId}</h2>
      <div className="board">{renderSquares()}</div>

      <div className="info">
        <div className="disk-count">{diskCountText()}</div>
        <div className="your-color">あなたの色: {colorInJapanese(myDisk())}</div>
        <div className="rival">対戦相手: {rivalId()}</div>
        <div className="turn">順番: {turnText()}</div>
        {renderMessage()}
      </div>

      <div className="again" hidden={data.roomInfo.status !== 'end'}>
        <button onClick={gameAgain}>もう1回する</button>
      </div>
    </div>
  );
};

export default GameMulti;