import React, { useState, useEffect } from 'react';
import bg1 from '../assets/bg1.png';
import Player from './Player.js';
import Obstacle from './Obstacle.js';
import GameOver from './GameOver.js';

const Bg = () => {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gravity = 6;
  const birdWidth = 50;
  const birdHeight = 50;
  const obstacleWidth = 60;
  const gapSize = 150;
  const obstacleGap = 350;
  const gameAreaHeight = 600;
  const gameAreaWidth = 380;
  const birdLeft = 15;
  const jumpHeight = 40;

  useEffect(() => {
    let gameInterval;
    if (gameHasStarted && !isGameOver) {
      gameInterval = setInterval(() => {
        setBirdPosition(birdPosition => birdPosition + gravity);
        setObstacles(obstacles => {
          let newObstacles = obstacles.map(obstacle => ({
            ...obstacle,
            left: obstacle.left - 5
          }));

          newObstacles = newObstacles.filter(obstacle => obstacle.left > -obstacleWidth);

          if (newObstacles.length === 0 || newObstacles[newObstacles.length - 1].left < gameAreaWidth - obstacleGap) {
            const topHeight = Math.random() * (gameAreaHeight - gapSize - birdHeight);
            const bottomHeight = gameAreaHeight - topHeight - gapSize;
            newObstacles.push({
              topHeight,
              bottomHeight,
              left: gameAreaWidth,
              passed: false
            });
          }

          return newObstacles;
        });
      }, 35);
    }

    return () => clearInterval(gameInterval);
  }, [gameHasStarted, isGameOver]);

  useEffect(() => {
    const handleJump = () => {
      if (!gameHasStarted) {
        setGameHasStarted(true);
      }
      if (gameHasStarted && !isGameOver) {
        setBirdPosition(birdPosition => birdPosition - jumpHeight);
      }
      if (isGameOver) {
        restartGame();
      }
    };

    window.addEventListener('keydown', handleJump);
    window.addEventListener('touchstart', handleJump);

    return () => {
      window.removeEventListener('keydown', handleJump);
      window.removeEventListener('touchstart', handleJump);
    };
  }, [gameHasStarted, isGameOver]);

  useEffect(() => {
    const checkCollision = () => {
      const birdTop = birdPosition;
      const birdBottom = birdPosition + birdHeight;
      const birdRight = birdLeft + birdWidth;

      if (birdTop <= 0 || birdBottom >= gameAreaHeight) {
        setIsGameOver(true);
        return;
      }

      for (const obstacle of obstacles) {
        const obstacleLeft = obstacle.left;
        const obstacleRight = obstacle.left + obstacleWidth;

        if (
          birdRight > obstacleLeft &&
          birdLeft < obstacleRight &&
          (birdTop < obstacle.topHeight || birdBottom > gameAreaHeight - obstacle.bottomHeight)
        ) {
          setIsGameOver(true);
          break;
        }

        if (obstacleLeft + obstacleWidth === birdLeft && !obstacle.passed) {
          setScore(score => score + 1);
          setObstacles(prevObstacles => {
            return prevObstacles.map(prevObstacle => {
              if (prevObstacle === obstacle) {
                return { ...prevObstacle, passed: true };
              }
              return prevObstacle;
            });
          });
        }
      }
    };

    if (gameHasStarted && !isGameOver) {
      checkCollision();
    }
  }, [birdPosition, obstacles, gameHasStarted, isGameOver]);

  const restartGame = () => {
    setBirdPosition(250);
    setGameHasStarted(false);
    setObstacles([]);
    setIsGameOver(false);
    setScore(0);
  };

  return (
    <div className='h-screen w-screen flex justify-center items-center fixed' onClick={() => setGameHasStarted(true)}>
      <div className='absolute w-screen h-screen bg-zinc-800'>
        <img src={bg1} alt='bg' className='relative w-screen h-screen bg-no-repeat object-cover opacity-30 select-none'></img>
      </div>
      <div className='w-full h-full py-20 flex justify-center items-center'>
        <div className='relative' style={{ width: `${gameAreaWidth}px`, height: `${gameAreaHeight}px` }}>
          <div className='absolute w-full h-full bg-zinc-800' style={{ overflow: 'hidden' }}>
            <img src={bg1} alt='bg' className='absolute w-full h-full object-cover border-4 border-white select-none opacity-70'></img>
            <Player position={birdPosition} />
            {obstacles.map((obstacle, index) => (
              <React.Fragment key={index}>
                {obstacle.left > 0 && obstacle.left < gameAreaWidth && (
                  <>
                    <Obstacle top={0} left={obstacle.left} height={obstacle.topHeight} />
                    <Obstacle top={gameAreaHeight - obstacle.bottomHeight} left={obstacle.left} height={obstacle.bottomHeight} />
                  </>
                )}
              </React.Fragment>
            ))}
            {isGameOver && <GameOver score={score} restartGame={restartGame} />}
            {gameHasStarted && !isGameOver && <div className="absolute top-4 left-4 text-white text-2xl">Score: {score}</div>}
            {!gameHasStarted && <div className="absolute w-full h-full flex justify-center items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl backdrop-filter backdrop-blur-sm duration-1000">Press Space to Start</div>}
          </div>
        </div>
      </div>
    </div>
  );  
};

export default Bg;
