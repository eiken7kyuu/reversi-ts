import React, { useState } from 'react';
import './square.scss';
import { Disk } from '../reversi';

type SquareProps = {
  disk: Disk;
  clickHandle: () => void;
  cannotPut: boolean;
};

const Square: React.FC<SquareProps> = ({ disk, clickHandle, cannotPut }) => {
  const [cannotPutClass, setCannotPutClass] = useState('');

  function addClass() {
    // クラスを追加、一定時間後に削除
    setCannotPutClass('cannot-put');
    setTimeout(() => setCannotPutClass(''), 500);
  }

  return (
    <div className={`square ${cannotPutClass}`} onClick={cannotPut ? addClass : clickHandle}>
      <div className={`disk ${disk.toLowerCase()}`}></div>
    </div>
  );
};

export default Square;