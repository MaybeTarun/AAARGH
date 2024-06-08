import React, { useState, useEffect, useRef } from 'react';
import bg1 from '../assets/bg1.png';
import Player from './Player.js';
import Obstacle from './Obstacle.js';
import GameOver from './GameOver.js';
import Cookies from 'js-cookie';

const Bg = () => {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(Cookies.get('highScore') || 0);
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
  const middleRangeStart = 150;
  const middleRangeEnd = 450;

  const gameRef = useRef(null);

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
            const topHeight = Math.random() * (middleRangeEnd - middleRangeStart - gapSize) + middleRangeStart;
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
      }, 40);
    }

    return () => clearInterval(gameInterval);
  }, [gameHasStarted, isGameOver]);

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === ' ') {
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleJump);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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
        updateHighScore();
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
          updateHighScore();
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

  const updateHighScore = () => {
    if (score > highScore) {
      setHighScore(score);
      Cookies.set('highScore', score, { expires: 365 });
    }
  };

  const restartGame = () => {
    setBirdPosition(250);
    setGameHasStarted(false);
    setObstacles([]);
    setIsGameOver(false);
    setScore(0);
  };

  return (
    <div ref={gameRef} className='h-screen w-screen flex justify-center items-center fixed' onClick={() => setGameHasStarted(true)}>
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
                {obstacle.left > -obstacleWidth && (
                  <>
                    <Obstacle top={0} left={obstacle.left} height={obstacle.topHeight} />
                    <Obstacle top={gameAreaHeight - obstacle.bottomHeight} left={obstacle.left} height={obstacle.bottomHeight} />
                  </>
                )}
              </React.Fragment>
            ))}
            {isGameOver && <GameOver score={score} highScore={highScore} restartGame={restartGame} gameRef={gameRef} />}
            {gameHasStarted && !isGameOver && <div className="absolute top-4 left-4 text-white text-2xl">Score: {score}</div>}
            {!gameHasStarted && <div className="absolute w-full h-full flex justify-center items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl backdrop-filter backdrop-blur-sm duration-1000">Press Any Key to Start</div>}
          </div>
        </div>
      </div>
    </div>
  );  
};

export default Bg;
