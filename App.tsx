
import React, { useState, useCallback, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameStatus, Mission, WalletState, ChainType, Skin } from './types';
import { audioManager } from './utils/audio';
import { connectEVM, checkEVMConnection, truncateAddress } from './utils/wallet';
import { SKINS } from './constants';

export default function App() {
  const [score, setScore] = useState(0);

  // Initialize High Score from Local Storage
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hungry_jelly_highscore') || localStorage.getItem('vibe_code_highscore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Initialize selected skin from Local Storage
  const [selectedSkinId, setSelectedSkinId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hungry_jelly_skin') || localStorage.getItem('vibe_code_skin') || 'classic';
    }
    return 'classic';
  });

  const [gameStatus, setGameStatus] = useState<GameStatus>('MENU');
  const [mission, setMission] = useState<Mission | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // Wallet State
  const [wallet, setWallet] = useState<WalletState>({ address: null, chain: null, isConnected: false });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // We keep a reference to canvas mostly to ensure it is mounted, 
  // but logic is handled inside GameCanvas.
  const [, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Robust touch detection for mobile devices
    const touchMatch = window.matchMedia('(pointer: coarse)');
    setIsTouch(touchMatch.matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Auto-connect wallet on mount
  useEffect(() => {
    const attemptAutoConnect = async () => {
      // Try MegaETH Silent Connect
      const evmAddress = await checkEVMConnection();
      if (evmAddress) {
        setWallet({ address: evmAddress, chain: 'EVM', isConnected: true });
        return;
      }
    };
    attemptAutoConnect();
  }, []);

  // Keyboard Pause Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameStatus === 'PLAYING') {
          setGameStatus('PAUSED');
        } else if (gameStatus === 'PAUSED') {
          setGameStatus('PLAYING');
          audioManager.resume();
        } else if (showShop) {
          setShowShop(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, showShop]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleMissionUpdate = useCallback((updatedMission: Mission) => {
    setMission(updatedMission);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    // Sync score state to ensure Game Over screen is accurate
    setScore(finalScore);
    setGameStatus('GAME_OVER');
    setHighScore(prev => {
      if (finalScore > prev) {
        localStorage.setItem('hungry_jelly_highscore', finalScore.toString());
        return finalScore;
      }
      return prev;
    });
  }, []);

  const handleSelectSkin = (skinId: string) => {
    setSelectedSkinId(skinId);
    localStorage.setItem('hungry_jelly_skin', skinId);
  };

  const startGame = () => {
    audioManager.resume();
    setScore(0);
    setGameStatus('PLAYING');
  };

  const resumeGame = () => {
    audioManager.resume();
    setGameStatus('PLAYING');
  };

  const handleConnect = async (chain: ChainType) => {
    if (isConnecting) return;
    setIsConnecting(true);

    let address: string | null = null;

    if (chain === 'EVM') {
      address = await connectEVM();
    }

    if (address) {
      setWallet({ address, chain, isConnected: true });
      setShowWalletModal(false);
    }
    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    // For a true disconnect we might want to clear local storage if we used it,
    // but clearing state is sufficient for this session.
    setWallet({ address: null, chain: null, isConnected: false });
  };

  const currentSkin = SKINS.find(s => s.id === selectedSkinId) || SKINS[0];

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-[#87CEEB] font-fredoka touch-none select-none">
      {/* Game Canvas */}
      <GameCanvas
        status={gameStatus}
        currentSkin={currentSkin}
        onScoreUpdate={handleScoreUpdate}
        onMissionUpdate={handleMissionUpdate}
        onGameOver={handleGameOver}
        setCanvasRef={setCanvasEl}
      />

      {/* UI Overlay - HUD */}
      {(gameStatus === 'PLAYING' || gameStatus === 'PAUSED') && (
        <>
          {/* Top Left: Score */}
          <div className="absolute top-5 left-5 text-white pointer-events-none select-none z-10">
            <div className="text-2xl md:text-4xl text-stroke-black font-bold">
              Fatness: {100 + score}%
            </div>
            {/* Wallet Badge in Game */}
            {wallet.isConnected && (
              <div className="mt-1 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs md:text-sm inline-flex items-center gap-2 border border-white/30">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {truncateAddress(wallet.address!)}
              </div>
            )}
          </div>

          {/* Top Right: Mission & Pause */}
          <div className="absolute top-5 right-5 flex flex-col items-end gap-2 z-10 pointer-events-none">
            {/* Pause Button */}
            <button
              onClick={() => setGameStatus(gameStatus === 'PLAYING' ? 'PAUSED' : 'PLAYING')}
              className="bg-white border-4 border-black rounded-full w-12 h-12 flex items-center justify-center pointer-events-auto hover:bg-gray-100 active:scale-95 transition-transform shadow-lg"
              aria-label="Pause Game"
            >
              {gameStatus === 'PAUSED' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" width="24" height="24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              )}
            </button>

            {/* Mission Card */}
            {mission && (
              <div className={`bg-white border-4 border-black rounded-xl p-3 shadow-lg transition-transform duration-300 w-48 md:w-64 ${mission.completed ? 'scale-110 bg-yellow-100' : 'scale-100'}`}>
                <div className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Current Mission
                </div>
                <div className="text-md md:text-xl text-black font-bold leading-tight mb-2">
                  {mission.completed ? "MISSION COMPLETE!" : mission.description}
                </div>

                {!mission.completed && (
                  <div className="w-full bg-gray-300 h-3 rounded-full border-2 border-black overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all duration-300 ease-out"
                      style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                    />
                  </div>
                )}
                {!mission.completed && (
                  <div className="text-right text-xs font-bold mt-1">
                    {Math.floor(mission.current)} / {mission.target}
                  </div>
                )}
                {mission.completed && (
                  <div className="text-center text-green-600 font-bold animate-pulse">
                    +{mission.reward} Points!
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Start Menu Overlay */}
      {gameStatus === 'MENU' && !showWalletModal && !showShop && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
          <div className="bg-white p-8 rounded-3xl shadow-[0_10px_0_rgba(0,0,0,0.2)] border-4 border-black text-center max-w-md w-full mx-4">
            <img src="/logo.png" alt="Hungry Jelly" className="w-full max-w-[400px] mx-auto mb-6 transform hover:scale-105 transition-transform duration-300 drop-shadow-2xl" />
            <p className="text-gray-600 text-lg md:text-xl mb-4">
              {isTouch ? "Touch and drag to wobble and eat!" : "Move your mouse to wobble and eat!"}
            </p>

            {highScore > 0 && (
              <div className="text-2xl md:text-3xl text-purple-600 font-bold mb-6 text-stroke-black-sm">
                High Score: {100 + highScore}%
              </div>
            )}

            <button
              onClick={startGame}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black text-2xl md:text-3xl py-4 rounded-xl border-b-8 border-yellow-600 active:border-b-0 active:translate-y-2 transition-all font-bold mb-3"
            >
              PLAY
            </button>

            {/* Shop Button */}
            <button
              onClick={() => setShowShop(true)}
              className="w-full bg-pink-400 hover:bg-pink-300 text-black text-xl md:text-2xl py-3 rounded-xl border-b-8 border-pink-600 active:border-b-0 active:translate-y-2 transition-all font-bold mb-3 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 007.5 9.75c1.13 0 2.146-.518 2.829-1.344.383.996 1.354 1.719 2.493 1.719 1.139 0 2.11-.723 2.493-1.719.683.826 1.699 1.344 2.829 1.344a3.75 3.75 0 004.902-5.652l-1.3-1.299a1.875 1.875 0 00-1.325-.55H5.223z" />
                <path fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 009.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 002.25.506c1.42.674 3.08.675 4.5 0v8.755h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3zm3-6a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-3zm8.25-.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-3z" clipRule="evenodd" />
              </svg>
              SHOP
            </button>

            {/* Wallet Button */}
            <button
              onClick={() => wallet.isConnected ? disconnectWallet() : setShowWalletModal(true)}
              className={`w-full text-lg py-3 rounded-xl border-b-8 active:border-b-0 active:translate-y-2 transition-all font-bold flex items-center justify-center gap-2 ${wallet.isConnected ? 'bg-gray-200 text-gray-800 border-gray-400' : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800'}`}
            >
              {wallet.isConnected ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  {truncateAddress(wallet.address!)}
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Shop Overlay */}
      {showShop && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-30">
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-black w-full max-w-4xl mx-4 h-[80vh] flex flex-col overflow-hidden animate-bounce-in">
            {/* Shop Header */}
            <div className="p-4 border-b-4 border-black bg-pink-400 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white text-stroke-black-sm">SKIN SHOP</h2>
              <button onClick={() => setShowShop(false)} className="bg-white border-2 border-black rounded-lg p-2 font-bold hover:bg-gray-100">
                CLOSE
              </button>
            </div>

            {/* Shop Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SKINS.map(skin => {
                  const isUnlocked = highScore >= skin.unlockScore;
                  const isSelected = selectedSkinId === skin.id;

                  return (
                    <div
                      key={skin.id}
                      className={`relative bg-white rounded-xl border-4 p-4 flex flex-col items-center transition-all ${isSelected ? 'border-green-500 bg-green-50 scale-105' : 'border-black hover:border-gray-500'}`}
                    >
                      {/* Preview Circle */}
                      <div
                        className="w-20 h-20 rounded-full mb-3 shadow-sm border-2 border-black flex items-center justify-center"
                        style={{ backgroundColor: skin.color }}
                      >
                        {/* Eye Preview */}
                        <div className="flex gap-2">
                          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden" style={{ backgroundColor: skin.eyeColor }}>
                            <div className={`w-2 h-2 rounded-full ${skin.eyeColor === '#000000' ? 'bg-white' : 'bg-black'}`}></div>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden" style={{ backgroundColor: skin.eyeColor }}>
                            <div className={`w-2 h-2 rounded-full ${skin.eyeColor === '#000000' ? 'bg-white' : 'bg-black'}`}></div>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold text-xl mb-1">{skin.name}</h3>
                      <p className="text-gray-500 text-xs text-center mb-3 h-8">{skin.description}</p>

                      {isUnlocked ? (
                        <button
                          onClick={() => handleSelectSkin(skin.id)}
                          disabled={isSelected}
                          className={`w-full py-2 rounded-lg font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isSelected ? 'bg-green-500 text-white border-green-700' : 'bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-600'}`}
                        >
                          {isSelected ? 'SELECTED' : 'SELECT'}
                        </button>
                      ) : (
                        <div className="w-full py-2 rounded-lg font-bold bg-gray-300 text-gray-500 border-b-4 border-gray-400 flex items-center justify-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                          </svg>
                          LOCKED
                        </div>
                      )}

                      {!isUnlocked && (
                        <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold border border-red-200">
                          Need {100 + skin.unlockScore}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {gameStatus === 'PAUSED' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <div className="bg-white p-8 rounded-3xl shadow-[0_10px_0_rgba(0,0,0,0.2)] border-4 border-black text-center max-w-sm w-full mx-4 animate-bounce-in">
            <h2 className="text-4xl md:text-5xl text-blue-500 mb-6 text-stroke-black-sm">PAUSED</h2>

            <button
              onClick={resumeGame}
              className="w-full bg-green-400 hover:bg-green-300 text-black text-2xl md:text-3xl py-4 rounded-xl border-b-8 border-green-600 active:border-b-0 active:translate-y-2 transition-all font-bold mb-4"
            >
              RESUME
            </button>

            <button
              onClick={() => setGameStatus('MENU')}
              className="w-full bg-red-400 hover:bg-red-300 text-black text-xl md:text-2xl py-3 rounded-xl border-b-8 border-red-600 active:border-b-0 active:translate-y-2 transition-all font-bold"
            >
              QUIT TO MENU
            </button>
          </div>
        </div>
      )}

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-30">
          <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-black w-full max-w-sm mx-4 animate-bounce-in">
            <h2 className="text-2xl font-bold text-center mb-6 text-black">Select Wallet</h2>

            <button
              onClick={() => handleConnect('EVM')}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white text-lg py-3 rounded-xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all font-bold mb-3 flex items-center justify-center relative"
            >
              {isConnecting ? "Connecting..." : "Connect MegaETH"}
            </button>


            <button
              onClick={() => !isConnecting && setShowWalletModal(false)}
              className="w-full text-gray-500 font-bold hover:text-black cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameStatus === 'GAME_OVER' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 backdrop-blur-md z-10">
          <div className="bg-white p-8 rounded-3xl shadow-[0_10px_0_rgba(0,0,0,0.2)] border-4 border-black text-center max-w-md w-full mx-4 animate-bounce-in">
            <h2 className="text-4xl md:text-5xl text-red-500 mb-2 text-stroke-black-sm">Ouch!</h2>
            <p className="text-xl md:text-2xl text-gray-800 mb-4">You got too skinny!</p>

            <div className="bg-gray-100 rounded-xl p-4 mb-8 border-2 border-gray-200">
              <div className="text-gray-500 text-lg">Final Fatness</div>
              <div className="text-3xl md:text-4xl text-black font-bold mb-2">{100 + score}%</div>

              <div className="text-gray-400 text-sm uppercase tracking-wider font-bold">Best Ever</div>
              <div className="text-xl text-purple-600 font-bold">{100 + Math.max(score, highScore)}%</div>

              {score >= highScore && score > 0 && (
                <div className="text-yellow-500 font-bold mt-2 animate-pulse">NEW RECORD!</div>
              )}
            </div>

            <button
              onClick={startGame}
              className="w-full bg-green-400 hover:bg-green-300 text-black text-2xl md:text-3xl py-4 rounded-xl border-b-8 border-green-600 active:border-b-0 active:translate-y-2 transition-all font-bold"
            >
              TRY AGAIN
            </button>

            <button
              onClick={() => setGameStatus('MENU')}
              className="w-full mt-4 text-gray-600 font-bold hover:text-black"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
