
import {
  getLine, gameSet, initBoard,
  canPut, pass, getReverseList, reverse, Position, cloneBoard, createFilledBoard
} from '../reversi';

describe('getLine', () => {
  function test(line: { x: number, y: number }[], expected: { x: number, y: number }[]) {
    for (let i = 0; i < line.length; i++) {
      expect(line[i]).toEqual(expected[i]);
    }
  }

  it('左', () => {
    const line = getLine({ x: 2, y: 4 }, 'left');
    const expected = [{ x: 1, y: 4 }, { x: 0, y: 4 }];
    test(line, expected);
  });

  it('左上', () => {
    const line = getLine({ x: 2, y: 4 }, 'upLeft');
    const expected = [{ x: 1, y: 3 }, { x: 0, y: 2 }];
    test(line, expected);
  });

  it('上', () => {
    const line = getLine({ x: 2, y: 4 }, 'up');
    const expected = [{ x: 2, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 0 }];
    test(line, expected);
  });

  it('右上', () => {
    const line = getLine({ x: 2, y: 4 }, 'upRight');
    const expected = [{ x: 3, y: 3 }, { x: 4, y: 2 }, { x: 5, y: 1 }, { x: 6, y: 0 }];
    test(line, expected);
  });

  it('右', () => {
    const line = getLine({ x: 2, y: 4 }, 'right');
    const expected = [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }];
    test(line, expected);
  });

  it('右下', () => {
    const line = getLine({ x: 2, y: 4 }, 'downRight');
    const expected = [{ x: 3, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 7 }];
    test(line, expected);
  });

  it('下', () => {
    const line = getLine({ x: 2, y: 4 }, 'down');
    const expected = [{ x: 2, y: 5 }, { x: 2, y: 6 }, { x: 2, y: 7 }];
    test(line, expected);
  });

  it('左下', () => {
    const line = getLine({ x: 2, y: 4 }, 'downLeft');
    const expected = [{ x: 1, y: 5 }, { x: 0, y: 6 }];
    test(line, expected);
  });
});


describe('gameSet', () => {
  it('ボードが埋まりゲーム終了', () => {
    const filled = createFilledBoard('White');
    const filled2 = createFilledBoard('Black');
    filled[0][2] = 'Black';
    filled[0][3] = 'Black';
    filled2[0][0] = 'White';
    filled2[0][1] = 'White';

    expect(gameSet(filled)).toBeTruthy();
    expect(gameSet(filled2)).toBeTruthy();
  });

  it('ボードが1色', () => {
    const whiteOnly = createFilledBoard('White');
    const blackOnly = createFilledBoard('Black');

    whiteOnly[0][2] = 'None';
    whiteOnly[0][0] = 'None';
    blackOnly[0][2] = 'None';
    blackOnly[0][0] = 'None';
    expect(gameSet(whiteOnly)).toBeTruthy();
    expect(gameSet(blackOnly)).toBeTruthy();
  });

  it('ゲーム中', () => {
    const board1 = initBoard();
    const board2 = initBoard();
    board2[5][4] = 'Black';
    board2[4][4] = 'Black';
    board2[5][3] = 'White';
    board2[4][3] = 'White';

    expect(gameSet(board1)).toBeFalsy();
    expect(gameSet(board2)).toBeFalsy();
  });
});

describe('canPut', () => {
  it('置ける', () => {
    const board = initBoard();
    expect(canPut(board, { x: 3, y: 2 }, 'Black')).toBeTruthy();
    expect(canPut(board, { x: 2, y: 3 }, 'Black')).toBeTruthy();
    expect(canPut(board, { x: 4, y: 5 }, 'Black')).toBeTruthy();
    expect(canPut(board, { x: 5, y: 4 }, 'Black')).toBeTruthy();
  });

  it('置けない', () => {
    const board = initBoard();
    expect(canPut(board, { x: 6, y: 4 }, 'Black')).toBeFalsy();
    expect(canPut(board, { x: 4, y: 2 }, 'Black')).toBeFalsy();
  });
});

describe('pass', () => {
  function createData() {
    const board = initBoard();
    for (let i = 0; i < 5; i++) {
      board[i] = ['White', 'White', 'White', 'White', 'White', 'White', 'White', 'White'];
    }

    board[5] = ['Black', 'Black', 'Black', 'Black', 'Black', 'Black', 'Black', 'Black'];
    return board;
  }

  it('パスする', () => {
    expect(pass(createData(), 'Black')).toBeTruthy();
  });

  it('パスできない', () => {
    expect(pass(createData(), 'White')).toBeFalsy();
  });
});

describe('getReverseList', () => {
  const board = initBoard();
  // 初期状態から
  it('白1つひっくり返す', () => {
    const list = getReverseList(board, { x: 3, y: 2 }, 'Black');
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual({ x: 3, y: 3 });
    expect(board[list[0].y][list[0].x]).toEqual('White');

    const list2 = getReverseList(board, { x: 4, y: 5 }, 'Black');
    expect(list2).toHaveLength(1);
    expect(list2[0]).toEqual({ x: 4, y: 4 });
    expect(board[list[0].y][list[0].x]).toEqual('White');
  });
});

describe('reverse', () => {
  it('対象の位置の色が白から黒に変わる', () => {
    // 初期状態
    const board = initBoard();
    const putPosition: Position = { x: 3, y: 2 };
    const list = getReverseList(board, putPosition, 'Black');
    list.push(putPosition);

    expect(board[2][3]).toEqual('None');
    expect(board[3][3]).toEqual('White');
    const newBoard = reverse(board, list, 'Black');
    expect(newBoard[2][3]).toEqual('Black');
    expect(newBoard[3][3]).toEqual('Black');
  });
});

describe('cloneBoard', () => {
  it('元のデータが書き換わらないこと', () => {
    const board = initBoard();
    const newBoard = cloneBoard(board);

    newBoard[4][4] = 'Black';
    newBoard[0][0] = 'Black';
    expect(board[4][4]).toEqual('White');
    expect(newBoard[4][4]).toEqual('Black');
    expect(board[0][0]).toEqual('None');
    expect(newBoard[0][0]).toEqual('Black');
  });
});