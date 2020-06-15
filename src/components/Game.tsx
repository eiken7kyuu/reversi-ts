import React, { useState, useEffect } from 'react';
import Square from './Square';
import './style.scss';

type Disk = 'White' | 'Black' | 'None';

type Pair = {
  x: number;
  y: number;
};

const directions: Pair[] = [ 
  { x: -1, y: 0 }, // 左横
  { x: -1, y: -1 }, // 左横
  { x: 0, y: -1 }, // 上
  { x: 1, y: -1 }, // 右上
  { x: 1, y: 0 }, // 右横
  { x: 1, y: 1 }, // 右下
  { x: 0, y: 1 }, // 下
  { x: -1, y: 1 }  // 左下
];

// 置いた場所と方向を引数に、1ラインの座標を取得する
export function getLine(putPos: Pair, dire: Pair): Pair[] {
  let line = [];
  let x = putPos.x + dire.x;
  let y = putPos.y + dire.y;

  while (0 <= x && x <= 7 && 0 <= y && y <= 7) {
    line.push({ x: x, y: y });

    x += dire.x;
    y += dire.y;
  }

  return line;
}

function getLines(putPos: Pair) {
  return directions.map(dire => getLine(putPos, dire));
}

function initBoard() {
  const board = Array.from(new Array<Disk>(8), () => new Array<Disk>(8).fill('None'));
  board[3][3] = 'White';
  board[4][4] = 'White';
  board[3][4] = 'Black';
  board[4][3] = 'Black';
  return board;
}

const Game: React.FC = () => {

  const [isBlackPlayer, setIsBlackPlayer] = useState(true);
  const [board, setBoard] = useState<Disk[][]>(initBoard());
  const [turnText, setTurnText] = useState(nextTurnText());
  const [message, setMessage] = useState('');

  // 順番が更新されたタイミングで発火させる
  useEffect(() => {
    if (gameSet()) {
      result();
      return;
    }

    // 相手の番で置けないとき
    if (!canPut()) {
      setMessage('置ける場所がないからパス');
      setIsBlackPlayer(!isBlackPlayer);
      setTurnText(isBlackPlayer ? '白の番' : '黒の番');
      return;
    }

  }, [isBlackPlayer]);

  const rivalDisk = () => isBlackPlayer ? 'White' : 'Black';
  const myDisk = () => isBlackPlayer ? 'Black' : 'White';

  // 名前変更
  function nextTurnText() {
    return isBlackPlayer ? '黒の番' : '白の番';
  }

  // 結果表示
  function result() {
    const whiteCount = board.flatMap(x => x.filter(disk => disk === 'White')).length;
    const blackCount = board.flatMap(x => x.filter(disk => disk === 'Black')).length;

    if (whiteCount > blackCount) {
      setMessage(`黒 = ${blackCount}, 白 = ${whiteCount}: 白の勝ち`);
    } else if (whiteCount === blackCount) {
      setMessage(`黒 = ${blackCount}, 白 = ${whiteCount}: 引き分け`);
    } else {
      setMessage(`黒 = ${blackCount}, 白 = ${whiteCount}: 黒の勝ち`);
    }

    setTurnText('');
  }

  function gameSet() {
    return board.slice().flatMap(x => x.filter(disk => disk !== 'None')).length === 64;
  }


  // ひっくり返せる場所のリストを返す
  function getReverseDiskPosition(putPosition: Pair) {
    const tmpBoard = board.slice();
    const reverseList: Pair[][] = [];

    for (const line of getLines(putPosition)) {
      const list: Pair[] = [];

      for (let i = 0; i < line.length; i++) {
        const position = line[i];
        const lineDisk = tmpBoard[position.y][position.x]; // ライン上にある石

        // 1ラインでひっくり返すものがない
        if (lineDisk === 'None' || 
            (i === 0 && lineDisk === myDisk()) ||
            (i === line.length-1 && lineDisk === rivalDisk())) {
          break;
        }

        if (lineDisk === rivalDisk()) {
          list.push(position);
        }

        if (lineDisk === myDisk()) {
          reverseList.push(list);
          break;
        }
      }
    }

    return reverseList.flatMap(x => x);
  }

  // 置ける場所があるかチェックする
  function canPut(): boolean {
    const tmpBoard = board.slice();
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (tmpBoard[y][x] !== 'None') continue;

        const reverseList = getReverseDiskPosition({ x: x, y: y });
        if (reverseList.length > 0) {
          return true;
        }
      }
    }

    return false;
  }

  // ひっくり返す
  function reverse(reverseList: Pair[]) {
    const tmpBoard = board.slice();

    for (const position of reverseList) {
      tmpBoard[position.y][position.x] = myDisk();
    }

    setBoard(tmpBoard);
  }
  
  // マスをクリックしたときに動作する関数を返す
  function clickHandle(pos: Pair): () => void {
    return () => {
      const tmpBoard = board.slice();

      if (gameSet()) {
        result();
        return;
      }

      const reverseList = getReverseDiskPosition(pos);
      if (tmpBoard[pos.y][pos.x] !== 'None' ||
          (tmpBoard[pos.y][pos.x] === 'None' && reverseList.length <= 0)
      ) {
        setMessage('そこにはおけないよ');
        return;
      }

      setMessage('');
      tmpBoard[pos.y][pos.x] = myDisk();

      reverse(reverseList);
      setBoard(tmpBoard);
      setIsBlackPlayer(!isBlackPlayer);
      setTurnText(isBlackPlayer ? '白の番' : '黒の番');
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
    <div>
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
        <div className="turn">{turnText}</div>
        <div className="message">{message}</div>
      </div>
    </div>
  );
};

export default Game;