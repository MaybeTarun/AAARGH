import React from 'react';
import share from '../assets/share.png';

const GameOver = ({ score, highScore }) => {
  return (
    <div className="absolute inset-0 flex justify-center items-center text-white text-2xl backdrop-filter backdrop-blur-sm duration-1000">
      <div className='flex justify-center items-center flex-col'>
        <p className='text-3xl'>Game Over</p>
        <p>Score: {score}</p>
        <p>High Score: {highScore}</p>
        <p>Press Any Key to Restart</p>
      </div>
    </div>
  );
};

export default GameOver;
