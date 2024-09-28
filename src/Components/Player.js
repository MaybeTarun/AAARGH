import React from 'react';
import player1 from '../assets/player1.png';

const Player = React.memo(({ position }) => {
  const birdLeft = 15;

  return (
    <div className='relative' style={{ top: `${position}px`, left: `${birdLeft}px`, width: '40px', height: '40px' }}>
      <img src={player1} alt='player' className='bg-no-repeat w-full h-full select-none' />
    </div>
  );
});

export default Player;
