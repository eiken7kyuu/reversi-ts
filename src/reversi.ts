export type Disk = 'White' | 'Black' | 'None';

type Repeat8<T extends readonly unknown[]> = [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T];
type BoardRow = Repeat8<[Disk]>;
export type Board = Repeat8<[BoardRow]>;

export const BOARD_RANGE = [0, 1, 2, 3, 4, 5, 6, 7] as const;
type BoardRange = (typeof BOARD_RANGE)[number];

export type Position = {
  x: BoardRange;
  y: BoardRange;
};

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  upLeft: { x: -1, y: -1 },
  upRight: { x: 1, y: -1 },
  downLeft: { x: -1, y: 1 },
  downRight: { x: 1, y: 1 },
} as const;

type Direction = typeof DIRECTIONS;
type DirectionKey = keyof Direction;

const DIRECTION_KEYS: readonly DirectionKey[]
  = ['up', 'down', 'left', 'right', 'upLeft', 'upRight', 'downLeft', 'downRight'] as const;

const rivalDisk = (myDisk: Disk) => myDisk === 'Black' ? 'White' : 'Black';

export function createFilledBoard(disk: Disk): Board {
  const createBoardRow = (value: Disk): BoardRow => {
    return [value, value, value, value, value, value, value, value];
  }

  const row = createBoardRow(disk);
  return [[...row], [...row], [...row], [...row], [...row], [...row], [...row], [...row]];
}

export function initBoard(): Board {
  const board: Board = createFilledBoard('None');
  board[3][3] = 'White';
  board[4][4] = 'White';
  board[3][4] = 'Black';
  board[4][3] = 'Black';
  return board;
}

// 置いた場所から指定した方向にあるマス(ボードの範囲内)の座標全て取得
export function getLine(putPos: Position, key: DirectionKey): Position[] {
  const line: Position[] = [];
  const dire = DIRECTIONS[key];
  let position = { x: putPos.x + dire.x, y: putPos.y + dire.y };

  while (hasBoardRange(position)) {
    line.push(position);
    position = { x: position.x + dire.x, y: position.y + dire.y };
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
export function canPut(board: Board, pos: Position, myDisk: Disk): boolean {
  const reverseList = getReverseList(board, pos, myDisk);
  return board[pos.y][pos.x] === 'None' && reverseList.length > 0;
}

// パスしないといけないかチェック
export function pass(board: Board, myDisk: Disk): boolean {
  for (const y of BOARD_RANGE) {
    for (const x of BOARD_RANGE) {
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
export function getReverseList(board: Board, putPosition: Position, myDisk: Disk) {
  const reverseList: Position[][] = [];
  const rival = rivalDisk(myDisk);

  // 置いた場所から8方向のライン座標をチェック
  for (const line of DIRECTION_KEYS.map(key => getLine(putPosition, key))) {
    const list: Position[] = [];

    // 1ラインずつチェック
    for (let i = 0; i < line.length; i++) {
      const position = line[i];
      const nextDisk = board[position.y][position.x];

      // 1ラインでひっくり返すものがない
      if (nextDisk === 'None' ||
        (i === 0 && nextDisk === myDisk) ||
        (i === line.length - 1 && nextDisk === rival)) {
        break;
      }

      if (nextDisk === rival) list.push(position);

      if (nextDisk === myDisk) {
        reverseList.push(list);
        break;
      }
    }
  }

  return reverseList.flatMap(x => x);
}

// ボード、ひっくり返す位置、自分の色を渡して、ひっくり返したあとのボードを返す
export function reverse(board: Board, reverseList: Position[], myDisk: Disk): Board {
  const newBoard: Board = cloneBoard(board);
  for (const position of reverseList) {
    newBoard[position.y][position.x] = myDisk;
  }

  return newBoard;
}

function hasBoardRange(position: { x: number, y: number }): position is Position {
  return position.x in BOARD_RANGE && position.y in BOARD_RANGE;
}

export function cloneBoard(board: Board): Board {
  return [
    [...board[0]],
    [...board[1]],
    [...board[2]],
    [...board[3]],
    [...board[4]],
    [...board[5]],
    [...board[6]],
    [...board[7]],
  ];
}