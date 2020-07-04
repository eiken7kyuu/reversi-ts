import React from 'react';
import './square.scss';

type SquareProps = {
  disk: string;
  clickHandle: () => void;
};

const Square: React.FC<SquareProps> = ({ disk, clickHandle }) => {
  return (
    <button className="square" onClick={clickHandle}>
      <div className={`disk ${disk.toLowerCase()}`}></div>
    </button>
  );
};

export default Square;