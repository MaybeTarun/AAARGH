import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import bg1 from '../assets/bg1.png';
import Player from './Player';
import Obstacle from './Obstacle';
import GameOver from './GameOver';
import Cookies from 'js-cookie';
import { FaMicrophone } from 'react-icons/fa';

const Bg = () => {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isScreaming, setIsScreaming] = useState(false);

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

  const gameRef = useRef(null);

  const [highScore, setHighScore] = useState(Cookies.get('highScore') || 0);

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
    let audioContext;
    let analyser;
    let microphone;
    let javascriptNode;

    const setupAudio = async () => {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.5;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          const values = array.reduce((a, b) => a + b) / array.length;
          
          const currentlyScreaming = values > 50;
          
          if (currentlyScreaming) {
            handleJump();
          }

          setIsScreaming(currentlyScreaming);
        };
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    setupAudio();

    return () => {
      if (javascriptNode) javascriptNode.onaudioprocess = null;
      if (microphone) microphone.disconnect();
      if (analyser) analyser.disconnect();
      if (javascriptNode) javascriptNode.disconnect();
      if (audioContext) audioContext.close();
    };
  }, [handleJump]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!gameHasStarted || isGameOver) return;

    const intervalDuration = 50;
    const gameInterval = setInterval(() => {
      setBirdPosition(prevPosition => Math.min(gameAreaHeight - birdHeight, prevPosition + gravity));
      setObstacles(prevObstacles => {
        let newObstacles = prevObstacles
          .map(obstacle => ({ ...obstacle, left: obstacle.left - 5 }))
          .filter(obstacle => obstacle.left > -obstacleWidth);

        if (newObstacles.length === 0 || newObstacles[newObstacles.length - 1].left < gameAreaWidth - obstacleGap) {
          const topHeight = Math.random() * (450 - 150 - gapSize) + 150;
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
  }, [gameHasStarted, isGameOver, gravity, obstacleWidth, gapSize, obstacleGap, gameAreaWidth, gameAreaHeight, birdHeight]);

  const updateHighScore = useCallback(() => {
    if (score > highScore) {
      setHighScore(score);
      Cookies.set('highScore', score, { expires: 365 });
    }
  }, [score, highScore]);

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

  const startGame = () => {
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
                highScore={highScore}
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
                  <p className='mb-6 text-2xl'>Scream To Win!</p>
                  <div className='flex justify-center text-lg'>
                    <button
                      className='px-4 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out'
                      onClick={startGame}
                    >
                      Play
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className='absolute top-4 right-4 flex items-center'>
              <FaMicrophone
                className={`text-2xl ${isScreaming ? 'text-white' : 'text-gray-300'} transition-colors duration-200`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bg;