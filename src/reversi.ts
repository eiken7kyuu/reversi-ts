export type Disk = 'White' | 'Black' | 'None';
export type Board = Disk[][];

export type Pair = {
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

const rivalDisk = (myDisk: Disk) => myDisk === 'Black' ? 'White' : 'Black';

function isBoardRange(position: Pair) {
  return position.x >= 0 && position.x <= 7 && position.y >= 0 && position.y <= 7;
}

export function initBoard(): Board {
  const board = Array.from(new Array<Disk>(8), () => new Array<Disk>(8).fill('None'));
  board[3][3] = 'White';
  board[4][4] = 'White';
  board[3][4] = 'Black';
  board[4][3] = 'Black';
  return board;
}

// 置いた場所と方向を引数に、1ラインの座標を取得する
export function getLine(putPos: Pair, dire: Pair): Pair[] {
  const line = [];
  let x = putPos.x + dire.x;
  let y = putPos.y + dire.y;

  while (isBoardRange({ x: x, y: y })) {
    line.push({ x: x, y: y });

    x += dire.x;
    y += dire.y;
  }

  return line;
}

// ゲーム終了判定
// お互い置けなくなったら終了
export function gameSet(board: Board) {
  return pass(board, 'Black') && pass(board, 'White');
}

export function diskCount(board: Board): { whiteCount: number, blackCount: number } {
  return {
    whiteCount: board.flatMap(x => x.filter(disk => disk === 'White')).length,
    blackCount: board.flatMap(x => x.filter(disk => disk === 'Black')).length,
  };
}

// 指定した場所が置ける場所か
export function canPut(board: Board, pos: Pair, myDisk: Disk): boolean {
  const reverseList = getReverseList(board, pos, myDisk);
  return board[pos.y][pos.x] === 'None' && reverseList.length > 0;
}

// パスしないといけないかチェック
export function pass(board: Board, myDisk: Disk): boolean {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] !== 'None') continue;

      const reverseList = getReverseList(board, { x: x, y: y }, myDisk);
      if (reverseList.length > 0) {
        return false;
      }
    }
  }

  return true;
}

// ひっくり返す位置のリストを返す
export function getReverseList(board: Board, putPosition: Pair, myDisk: Disk) {
  const reverseList: Pair[][] = [];

  if (!isBoardRange(putPosition)) {
    throw new Error('not board range');
  }

  // 置いた場所から8方向のラインの座標をチェック
  for (const line of directions.map(dire => getLine(putPosition, dire))) {
    const list: Pair[] = [];

    for (let i = 0; i < line.length; i++) {
      const position = line[i];
      const lineDisk = board[position.y][position.x]; // ライン上にある石

      const rival = rivalDisk(myDisk);

      // 1ラインでひっくり返すものがない
      if (lineDisk === 'None' ||
        (i === 0 && lineDisk === myDisk) ||
        (i === line.length - 1 && lineDisk === rival)) {
        break;
      }

      if (lineDisk === rival) {
        list.push(position);
      }

      if (lineDisk === myDisk) {
        reverseList.push(list);
        break;
      }
    }
  }

  return reverseList.flatMap(x => x);
}

// ボード、ひっくり返す位置、自分の色を渡して、ひっくり返したあとのボードを返す
export function reverse(board: Board, reverseList: Pair[], myDisk: Disk): Board {
  const newBoard = board.slice();
  for (const position of reverseList) {
    newBoard[position.y][position.x] = myDisk;
  }

  return newBoard;
}