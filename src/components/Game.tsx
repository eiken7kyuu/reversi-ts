import React, { useState, useEffect } from 'react';
import Square from './Square';
import { Data } from '../multiPlay';
import './game.scss';
import { setRoomInfo } from '../repository';
import { initBoard, Pair, gameSet, canPut, getReverseList, reverse, pass, diskCount } from '../reversi';

type GameMultiProps = {
  view: 'room' | 'gameMulti';
  data: Data;
}

const GameMulti: React.FC<GameMultiProps> = ({ view, data }) => {
  if (view !== 'gameMulti') { return null; }

  const board = data.roomInfo.board.slice();
  const [message, setMessage] = useState('');
  const [hiddenAgainButton, setHiddenAgainButton] = useState(true);
  
  const passText = 'あなたは置ける場所がないからパスした';
  const isHost = () => data.myId === data.roomInfo.host;
  const myDisk = () => isHost() ? 'Black' : 'White';
  const rivalId = () => isHost() ? data.roomInfo.guest : data.roomInfo.host;
  const colorInJapanese = (myDisk: 'Black' | 'White') => {
    return myDisk === 'Black' ? '黒' : '白';
  };

  function diskCountText() {
    const { whiteCount, blackCount } = diskCount(board);
    return `黒: ${blackCount} vs 白: ${whiteCount}`;
  }

  function judge() {
    if (data.roomInfo.status !== 'end') return;
    const { whiteCount, blackCount } = diskCount(board);

    if ((blackCount > whiteCount && isHost()) ||
        (blackCount < whiteCount && !isHost())) {
      setMessage('あなたの勝ちです');
      return;
    }

    if ((blackCount < whiteCount && isHost()) ||
        (blackCount > whiteCount && !isHost())) {
      setMessage('相手の勝ちです');
      return;
    }

    if (blackCount === whiteCount) {
      setMessage('引き分けです');
    }
  }

  useEffect(init);

  // レンダリングごとに実行する
  function init() {
      // 自分のターンで、置く場所があるか判定
      // なければ相手のターンに変えて更新
      if (data.roomInfo.status === 'running' && 
          data.myId === data.roomInfo.turn && 
          pass(board, myDisk())) {

        data.roomInfo.turn = rivalId();
        setRoomInfo(data.roomId, data.roomInfo);
        setMessage(passText);
        return;
      }

      if (data.myId === data.roomInfo.turn && message === passText) {
        setMessage('');
      }

      if (data.roomInfo.status === 'end') {
        setHiddenAgainButton(false);
        judge();
      }

      if (data.roomInfo.status === 'running' && !hiddenAgainButton) {
        setMessage('');
        setHiddenAgainButton(true);
      }
  }

  function gameAgain() {
    data.roomInfo.board = initBoard();
    data.roomInfo.turn = data.roomInfo.host;
    data.roomInfo.status = 'running';
    setRoomInfo(data.roomId, data.roomInfo);
  }

  function turnText() {
    if (data.roomInfo.turn === 'none') {
      return '';
    }

    if (data.roomInfo.turn === data.myId) {
      return 'あなた';
    } else if (data.roomInfo.turn !== data.myId) {
      return '相手';
    }
  }

  // マスをクリックしたときに動作する関数を返す
  function clickHandle(pos: Pair): () => void {
    return () => {
      if (data.roomInfo.turn !== data.myId) {
        return;
      }

      if (!canPut(board, pos, myDisk())) {
        setMessage('そこは置けません');
        return;
      }

      setMessage('');

      const reverseList = getReverseList(board, pos, myDisk());
      reverseList.push({ x: pos.x, y: pos.y });
      data.roomInfo.board = reverse(board, reverseList, myDisk());
      data.roomInfo.turn = rivalId();

      if (gameSet(data.roomInfo.board)) {
        data.roomInfo.status = 'end';
        data.roomInfo.turn = 'none';
      }

      setRoomInfo(data.roomId, data.roomInfo);
    };
  }

  function renderSquare(pos: Pair) {
    return (<Square 
              key={`${pos.y}${pos.x}`}
              clickHandle={clickHandle(pos)}
              disk={board[pos.y][pos.x]}
            />);
  }

  return (
    <div className="container">
      <h2 className="room-id">ルーム: {data.roomId}</h2>
      <div className="board">
        {
          Array.from(new Array(8), () => new Array(8).fill(0))
            .map((y, yIndex) => {
              const squares = y.map((x, xIndex) => {
                return renderSquare({ x: xIndex, y: yIndex });
              })

              return (
                <div key={yIndex} className="row">
                  {squares}
                </div>
              );
            })
        }
      </div>

      <div className="info">
        <div className="disk-count">{diskCountText()}</div>
        <div className="your-color">あなたの色: {colorInJapanese(myDisk())}</div>
        <div className="rival">対戦相手: {rivalId()}</div>
        <div className="turn">順番: {turnText()}</div>
        <div className="message">{message}</div>
      </div>

      <div className="again" hidden={hiddenAgainButton}>
        <button onClick={gameAgain}>もう1回する</button>
      </div>
    </div>
  );
};

export default GameMulti;