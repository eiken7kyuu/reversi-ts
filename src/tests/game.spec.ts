
import { getLine } from '../components/Game';

describe('get line', () => {
  function test(line: { x: number, y: number }[], expected: { x: number, y: number }[]) {
    for (let i = 0; i < line.length; i++) {
      expect(line[i]).toEqual(expected[i]);
    }
  }

  it('左横', () => {
    const line = getLine({ x: 2, y: 4 }, { x: -1, y: 0 });
    const expected = [ { x: 1, y: 4}, { x: 0, y: 4} ];
    test(line, expected);
  });

  it('左上', () => {
    const line = getLine({ x: 2, y: 4 }, { x: -1, y: -1 });
    const expected = [ { x: 1, y: 3 }, { x: 0, y: 2 } ];
    test(line, expected);
  });

  it('上', () => {
    const line = getLine({ x: 2, y: 4 }, { x: 0, y: -1 });
    const expected = [ { x: 2, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 0 } ];
    test(line, expected);
  });

  it('右上', () => {
    const line = getLine({ x: 2, y: 4 }, { x: 1, y: -1 });
    const expected = [ { x: 3, y: 3}, { x: 4, y: 2 }, { x: 5, y: 1 }, { x: 6, y: 0 } ];
    test(line, expected);
  });

  it('右', () => {
    const line = getLine({ x: 2, y: 4 }, { x: 1, y: 0 });
    const expected = [ { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }];
    test(line, expected);
  });

  it('右下', () => {
    const line = getLine({ x: 2, y: 4 }, { x: 1, y: 1 });
    const expected = [ { x: 3, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 7 } ];
    test(line, expected);
  });

  it('下', () => {
    const line = getLine({ x: 2, y: 4 }, { x: 0, y: 1 });
    const expected = [ { x: 2, y: 5 }, { x: 2, y: 6 }, { x: 2, y: 7 }];
    test(line, expected);
  });

  it('左下', () => {
    const line = getLine({ x: 2, y: 4 }, { x: -1, y: 1 });
    const expected = [ { x: 1, y: 5 }, { x: 0, y: 6 } ];
    test(line, expected);
  });
});