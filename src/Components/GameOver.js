import React from 'react';

const GameOver = ({ score, restartGame }) => {
  return (
    <div className="absolute inset-0 flex justify-center items-center text-white text-2xl backdrop-filter backdrop-blur-sm duration-1000">
      <div className='flex justify-center items-center flex-col'>
        <p className='text-3xl'>Game Over</p>
        <p>Score: {score}</p>
        <p>Press Space to Restart</p>
      </div>
    </div>
  );
};

export default GameOver;
