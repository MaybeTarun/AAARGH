import React from 'react';
import share from '../assets/share.png';

const GameOver = ({ score }) => {
  return (
    <div className="absolute inset-0 flex justify-center items-center text-white text-2xl backdrop-filter backdrop-blur-sm duration-1000">
      <div className='flex justify-center items-center flex-col'>
        <p className='text-3xl'>Game Over</p>
        <p>Score: {score}</p>
        <p>Press Any Key to Restart</p>
        <button className='p-2'>
            <img src={share} alt='share' className='w-10 p-2 hover:bg-cyan-800 rounded-md border-2'></img>
        </button>
      </div>
    </div>
  );
};

export default GameOver;
