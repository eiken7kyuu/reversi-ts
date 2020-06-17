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
  const line = [];
  let x = putPos.x + dire.x;
  let y = putPos.y + dire.y;

  while (0 <= x && x <= 7 && 0 <= y && y <= 7) {
    line.push({ x: x, y: y });

    x += dire.x;
    y += dire.y;
  }

  return line;
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
  const [result, setResult] = useState('');

  const rivalDisk = () => isBlackPlayer ? 'White' : 'Black';
  const myDisk = () => isBlackPlayer ? 'Black' : 'White';

  function gameSet() {
    return board.flatMap(x => x.filter(disk => disk !== 'None')).length === 64;
  }

  function nextTurnText() {
    return isBlackPlayer ? '黒の番' : '白の番';
  }

  function diskCount(): { whiteCount: number, blackCount: number } {
    return {
      whiteCount: board.flatMap(x => x.filter(disk => disk === 'White')).length,
      blackCount: board.flatMap(x => x.filter(disk => disk === 'Black')).length,
    };
  }

  // 順番が更新されたタイミングで発火させる
  useEffect(() => {
    const { whiteCount, blackCount } = diskCount()
    setResult(`黒 = ${blackCount}, 白 = ${whiteCount}`);
    setTurnText(nextTurnText());

    if (gameSet()) {
      showResult();
      return;
    }

    // 相手の番で置けないとき
    if (!canPut()) {
      setMessage(`${(isBlackPlayer ? '黒' : '白')}は置ける場所がないからパスした`);
      setIsBlackPlayer(!isBlackPlayer);
      return;
    }

  }, [isBlackPlayer]);

  // 結果表示
  function showResult() {
    const { whiteCount, blackCount } = diskCount();
    const countText = `黒 = ${blackCount}, 白 = ${whiteCount}`;

    const resultText = (() => {
      if (whiteCount > blackCount) {
        return `${countText}: 白の勝ち`;
      } else if (whiteCount === blackCount) {
        return `${countText}: 引き分け`;
      } else {
        return `${countText}: 黒の勝ち`;
      }
    })();

    setResult(resultText);
    setTurnText('');
  }

  // ひっくり返せる場所のリストを返す
  function getReverseDiskPosition(putPosition: Pair) {
    const reverseList: Pair[][] = [];

    // 置いた場所から8方向のラインの座標をチェック
    for (const line of directions.map(dire => getLine(putPosition, dire))) {
      const list: Pair[] = [];

      for (let i = 0; i < line.length; i++) {
        const position = line[i];
        const lineDisk = board[position.y][position.x]; // ライン上にある石

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
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] !== 'None') continue;

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
        showResult();
        return;
      }

      const reverseList = getReverseDiskPosition(pos);
      if (tmpBoard[pos.y][pos.x] !== 'None' ||
          (tmpBoard[pos.y][pos.x] === 'None' && reverseList.length <= 0)
      ) {
        setMessage('そこは置けません');
        return;
      }

      reverseList.push({ x: pos.x, y: pos.y });
      reverse(reverseList);

      setMessage('');
      setIsBlackPlayer(!isBlackPlayer);
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
      <h1 className="title">オセロ</h1>
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
        <div className="turn">{turnText}<br/><span className="result">{result}</span></div>
        <div className="message">{message}</div>
      </div>
    </div>
  );
};

export default Game;