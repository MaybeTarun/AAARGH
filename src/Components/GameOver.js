import React from 'react';

const GameOver = ({ score, easyHighScore, hardHighScore, restartGame }) => {
  return (
    <div className="absolute inset-0 flex justify-center items-center text-white text-2xl backdrop-filter backdrop-blur-sm duration-1000">
      <div className='flex justify-center items-center flex-col'>
        <p className='text-4xl'>Game Over</p>
        <p><br/>Score: <span style={{ border: '2px solid white', padding: '0 5px' }}>{score}</span></p>
        <p className='underline'><br/>High Scores</p>
        <p>Easy: {easyHighScore} --- Hard: {hardHighScore}</p>
        <p className='text-2xl'><br/>Press Any Key to Restart</p>
      </div>
    </div>
  );
};

export default GameOver;
