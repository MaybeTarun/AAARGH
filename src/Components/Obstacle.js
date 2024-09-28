import React from 'react';
import obstacle1 from '../assets/obstacle1.png';

const Obstacle = React.memo(({ top, left, height }) => (
  <div style={{ position: 'absolute', top: `${top}px`, left: `${left}px`, width: '50px', height: `${height}px`, overflow: 'hidden' }}>
    <img src={obstacle1} alt='obstacle' className='select-none w-full h-full object-cover'/>
  </div>
));

export default Obstacle;
