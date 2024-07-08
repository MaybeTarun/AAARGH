import React from 'react';

const GameOver = ({ score, easyHighScore, hardHighScore, restartGame }) => {
  return (
    <div className="absolute inset-0 flex justify-center items-center text-white text-2xl backdrop-filter backdrop-blur-sm duration-1000">
      <div className='flex justify-center items-center flex-col'>
        <p className='text-4xl'>Game Over</p>
        <p><br/>Score: <span style={{ border: '2px solid white', padding: '0 5px' }}>{score}</span></p>
        <p className='underline'><br/>High Scores</p>
        <p>Easy: {easyHighScore} --- Hard: {hardHighScore}</p>
        <p><br/></p>
        <button
          className="mt-4 px-4 py-2 border-2 border-white text-white text-lg rounded-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out"
          onClick={restartGame}
        >
          Restart Game
        </button>
      </div>
    </div>
  );
};

export default GameOver;
