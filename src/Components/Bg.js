import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import bg1 from '../assets/bg1.png';
import Player from './Player';
import Obstacle from './Obstacle';
import GameOver from './GameOver';
import Cookies from 'js-cookie';

const Bg = () => {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(null);

  const gameConstants = useMemo(() => ({
    gravity: 5,
    birdWidth: 50,
    birdHeight: 50,
    obstacleWidth: 60,
    gapSize: 130,
    obstacleGap: 350,
    gameAreaHeight: 600,
    gameAreaWidth: 380,
    birdLeft: 15,
    jumpHeight: 40,
  }), []);

  const { gravity, birdWidth, birdHeight, obstacleWidth, gapSize, obstacleGap, gameAreaHeight, gameAreaWidth, birdLeft, jumpHeight } = gameConstants;

  const middleRangeStart = useMemo(() => difficulty === 'easy' ? 150 : 50, [difficulty]);
  const middleRangeEnd = useMemo(() => difficulty === 'easy' ? 450 : 550, [difficulty]);

  const gameRef = useRef(null);

  const [easyHighScore, setEasyHighScore] = useState(Cookies.get('easyHighScore') || 0);
  const [hardHighScore, setHardHighScore] = useState(Cookies.get('hardHighScore') || 0);

  const restartGame = useCallback(() => {
    setBirdPosition(250);
    setGameHasStarted(false);
    setObstacles([]);
    setIsGameOver(false);
    setScore(0);
  }, []);

  const handleJump = useCallback(() => {
    if (gameHasStarted && !isGameOver) {
      setBirdPosition(prevPosition => Math.max(0, prevPosition - jumpHeight));
    }
  }, [gameHasStarted, isGameOver, jumpHeight]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleJump);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleJump);
    };
  }, [handleJump]);

  useEffect(() => {
    if (!gameHasStarted || isGameOver) return;

    const intervalDuration = difficulty === 'easy' ? 50 : 40;
    const gameInterval = setInterval(() => {
      setBirdPosition(prevPosition => Math.min(gameAreaHeight - birdHeight, prevPosition + gravity));
      setObstacles(prevObstacles => {
        let newObstacles = prevObstacles
          .map(obstacle => ({ ...obstacle, left: obstacle.left - 5 }))
          .filter(obstacle => obstacle.left > -obstacleWidth);

        if (newObstacles.length === 0 || newObstacles[newObstacles.length - 1].left < gameAreaWidth - obstacleGap) {
          const topHeight = Math.random() * (middleRangeEnd - middleRangeStart - gapSize) + middleRangeStart;
          newObstacles.push({
            topHeight,
            bottomHeight: gameAreaHeight - topHeight - gapSize,
            left: gameAreaWidth,
            passed: false,
          });
        }

        return newObstacles;
      });
    }, intervalDuration);

    return () => clearInterval(gameInterval);
  }, [gameHasStarted, isGameOver, difficulty, middleRangeStart, middleRangeEnd, gravity, obstacleWidth, gapSize, obstacleGap, gameAreaWidth, gameAreaHeight, birdHeight]);

  const updateHighScore = useCallback(() => {
    if (difficulty === 'easy' && score > easyHighScore) {
      setEasyHighScore(score);
      Cookies.set('easyHighScore', score, { expires: 365 });
    } else if (difficulty === 'hard' && score > hardHighScore) {
      setHardHighScore(score);
      Cookies.set('hardHighScore', score, { expires: 365 });
    }
  }, [score, easyHighScore, hardHighScore, difficulty]);

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
          setScore((score) => score + 1);
          setObstacles((prevObstacles) => {
            return prevObstacles.map((prevObstacle) => {
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
  }, [
    birdPosition,
    obstacles,
    gameHasStarted,
    isGameOver,
    updateHighScore,
    birdLeft,
    birdWidth,
    birdHeight,
    gameAreaHeight,
    obstacleWidth,
  ]);

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setGameHasStarted(true);
  };

  return (
    <div ref={gameRef} className='h-screen w-screen flex justify-center items-center fixed'>
      <div className='absolute w-screen h-screen bg-zinc-800'>
        <img
          src={bg1}
          alt='bg'
          className='relative w-screen h-screen bg-no-repeat object-cover opacity-30 select-none'
        ></img>
      </div>
      <div className='w-full h-full py-20 flex justify-center items-center'>
        <div className='relative' style={{ width: `${gameAreaWidth}px`, height: `${gameAreaHeight}px` }}>
          <div className='absolute w-full h-full bg-zinc-800' style={{ overflow: 'hidden' }}>
            <img
              src={bg1}
              alt='bg'
              className='absolute w-full h-full object-cover border-4 border-white select-none opacity-70'
            ></img>
            <Player position={birdPosition} />
            {obstacles.map((obstacle, index) => (
              <React.Fragment key={index}>
                {obstacle.left > -obstacleWidth && (
                  <>
                    <Obstacle top={0} left={obstacle.left} height={obstacle.topHeight} />
                    <Obstacle
                      top={gameAreaHeight - obstacle.bottomHeight}
                      left={obstacle.left}
                      height={obstacle.bottomHeight}
                    />
                  </>
                )}
              </React.Fragment>
            ))}
            {isGameOver && (
              <GameOver
                score={score}
                highScore={difficulty === 'easy' ? easyHighScore : hardHighScore}
                easyHighScore={easyHighScore}
                hardHighScore={hardHighScore}
                restartGame={restartGame}
                gameRef={gameRef}
              />
            )}
            {gameHasStarted && !isGameOver && (
              <div className='absolute top-4 left-4 text-white text-2xl'>Score: {score}</div>
            )}
            {!gameHasStarted && (
              <div className='absolute w-full h-full flex justify-center items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl backdrop-filter backdrop-blur-sm duration-1000'>
                <div className='text-center'>
                  Select Game Mode
                  <div className='flex mt-4 justify-center text-lg'>
                    <button
                      className='mr-2 px-4 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out'
                      onClick={() => handleDifficultyChange('easy')}
                    >
                      Easy
                    </button>
                    <button
                      className='px-4 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out'
                      onClick={() => handleDifficultyChange('hard')}
                    >
                      Hard
                    </button>
                  </div>
                  <p className='mt-4 text-sm'>Scream To Win!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bg;