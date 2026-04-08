'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

const LOOT_PRIZES = [
  { name: 'Rare headset skin', points: 70 },
  { name: '30% off next purchase', points: 90 },
  { name: 'Golden controller badge', points: 85 },
  { name: 'Free shipping token', points: 60 },
  { name: 'XP booster pack', points: 75 },
];

const BOSS_ATTACKS = [
  'Fiery swipe',
  'Shield bash',
  'Shadow slash',
  'Pulse shock',
  'Laser flare',
];

const WORD_LIST = ['boost', 'power', 'stance', 'fusion', 'combo', 'rocket', 'legend', 'pixel', 'clutch', 'neon'];
const SALES_PRODUCTS = [
  { name: 'Headset', emoji: '🎧' },
  { name: 'Controller', emoji: '🕹️' },
  { name: 'Keyboard', emoji: '⌨️' },
  { name: 'Mouse', emoji: '🖱️' },
];
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const PUZZLE_PIECES = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'];
const PUZZLE_PATTERNS = [
  ['🔴', '🔵', '🟡'], // Round 1
  ['🟢', '🟣', '🟠', '🔴'], // Round 2
  ['🔵', '🟡', '🟢', '🟣', '🟠'], // Round 3
  ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'], // Round 4
  ['🟠', '🟣', '🟢', '🟡', '🔵', '🔴', '🔴'], // Round 5
];

export default function GameChallenges() {
  // Since we removed auth, always consider user "authenticated"
  const isAuthenticated = true;
  const [gameLog, setGameLog] = useState<string[]>([]);

  const addGameLog = (message: string) => {
    setGameLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Rock Paper Scissors Game State
  const [playerChoice, setPlayerChoice] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [computerChoice, setComputerChoice] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [rpsMessage, setRpsMessage] = useState('Choose rock, paper, or scissors to start!');
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);

  // Puzzle Game State
  const [puzzleRound, setPuzzleRound] = useState(1);
  const [puzzlePattern, setPuzzlePattern] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [puzzleStarted, setPuzzleStarted] = useState(false);
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  const [puzzleMessage, setPuzzleMessage] = useState('Match the pattern by clicking the colored gems in the correct order.');
  const [showingPattern, setShowingPattern] = useState(false);
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  const [lootResult, setLootResult] = useState<string | null>(null);
  const [lootSpinning, setLootSpinning] = useState(false);
  const [lootPoints, setLootPoints] = useState(0);

  const [bossHealth, setBossHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [battleMessage, setBattleMessage] = useState('Defeat the sentinel and claim mission victory.');
  const [battleOver, setBattleOver] = useState(false);

  const [ticTacToeBoard, setTicTacToeBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [ticTacToeTurn, setTicTacToeTurn] = useState<'X' | 'O'>('X');
  const [ticTacToeResult, setTicTacToeResult] = useState<string | null>(null);
  const [wordGameActive, setWordGameActive] = useState(false);
  const [wordTimer, setWordTimer] = useState(300);
  const [wordTarget, setWordTarget] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [wordScore, setWordScore] = useState(0);
  const [wordMessage, setWordMessage] = useState('Type the word shown before time runs out. Each correct word earns 2 points.');
  const [salesTarget, setSalesTarget] = useState(SALES_PRODUCTS[0]);
  const [salesScore, setSalesScore] = useState(0);
  const [salesTimeLeft, setSalesTimeLeft] = useState(30);
  const [salesActive, setSalesActive] = useState(false);
  const [salesMessage, setSalesMessage] = useState('Match the product and complete the sale before time runs out!');

  // Aviator Game State
  const [aviatorBet, setAviatorBet] = useState(10);
  const [aviatorBetInput, setAviatorBetInput] = useState('10');
  const aviatorMinBet = 1;
  const aviatorMaxBet = 100;
  const [aviatorCanPlay, setAviatorCanPlay] = useState(true);
  const [aviatorCrashPoint, setAviatorCrashPoint] = useState(1.00);
  const [aviatorMultiplier, setAviatorMultiplier] = useState(1.00);
  const [aviatorGameActive, setAviatorGameActive] = useState(false);
  const [aviatorCashedOut, setAviatorCashedOut] = useState(false);
  const [aviatorCrashed, setAviatorCrashed] = useState(false);
  const [aviatorWinnings, setAviatorWinnings] = useState(0);
  const [aviatorPlaneX, setAviatorPlaneX] = useState(0);
  const [aviatorGameId, setAviatorGameId] = useState('');
  const [aviatorMessage, setAviatorMessage] = useState('Place your bet and watch the plane take off! Cash out before it crashes.');

  // Helper function to save game score to the shared leaderboard and game log
  const saveGameScore = useCallback(async (gameName: string, points: number) => {
    if (isAuthenticated && addGameLog) {
      try {
        addGameLog(`${gameName}: Scored ${points} points`);
      } catch (error) {
        console.error('Failed to save game score:', error);
      }
    }
  }, [isAuthenticated, addGameLog]);

  const playRPS = useCallback((choice: 'rock' | 'paper' | 'scissors') => {
    const choices: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
    const computer = choices[Math.floor(Math.random() * 3)];
    
    setPlayerChoice(choice);
    setComputerChoice(computer);
    setGameActive(true);

    let result: 'win' | 'lose' | 'draw';
    
    if (choice === computer) {
      result = 'draw';
      setRpsMessage('🤝 It\'s a draw!');
    } else if (
      (choice === 'rock' && computer === 'scissors') ||
      (choice === 'paper' && computer === 'rock') ||
      (choice === 'scissors' && computer === 'paper')
    ) {
      result = 'win';
      setPlayerScore(prev => prev + 1);
      setRpsMessage('🎉 You won!');
    } else {
      result = 'lose';
      setComputerScore(prev => prev + 1);
      setRpsMessage('💀 Computer won!');
    }
    
    setGameResult(result);
    const pointsEarned = result === 'win' ? 50 : result === 'draw' ? 25 : 10;
    
    // Save score to user profile if authenticated
    if (result === 'win') {
      void saveGameScore('Rock Paper Scissors', pointsEarned);
    }
    
    console.log('Rock Paper Scissors result:', {
      game: 'Rock Paper Scissors',
      quest: 'Outwit the computer in a classic match',
      result: `${result.toUpperCase()}: You chose ${choice}, Computer chose ${computer}`,
      points: pointsEarned,
    });
  }, [saveGameScore]);

  const endWordGame = useCallback(() => {
    setWordGameActive(false);
    setWordMessage('Time is up! Well done on completing the word sprint.');
    
    // Save score to user profile if authenticated
    if (wordScore > 0) {
      void saveGameScore('Word Rush', wordScore);
    }
    
    console.log('Word game result:', {
      game: 'Word Rush',
      quest: 'Type as many words correctly in 5 minutes',
      result: `Completed ${Math.floor(wordScore / 2)} words in the timed run`,
      points: wordScore,
    });
  }, [wordScore, saveGameScore]);

  const endSalesGame = useCallback(() => {
    setSalesActive(false);
    setSalesMessage('Sale window closed! Great job completing orders quickly.');
    
    // Save score to user profile if authenticated
    if (salesScore > 0) {
      void saveGameScore('Sales Sprint', salesScore);
    }
    
    console.log('Sales game result:', {
      game: 'Market Sprint',
      quest: 'Complete fast product sales under pressure',
      result: `Completed ${salesScore / 10} sales`,
      points: salesScore,
    });
  }, [salesScore, saveGameScore]);

  useEffect(() => {
    if (!puzzleStarted || puzzleComplete) return;

    if (showingPattern) {
      // Show pattern sequence
      let index = 0;
      const showInterval = window.setInterval(() => {
        if (index < puzzlePattern.length) {
          setPuzzleMessage(`Watch: ${puzzlePattern.slice(0, index + 1).join(' ')}`);
          index++;
        } else {
          clearInterval(showInterval);
          setTimeout(() => {
            setShowingPattern(false);
            setPuzzleMessage('Now repeat the pattern by clicking the gems!');
            setPlayerSequence([]);
          }, 1000);
        }
      }, 800);
      return () => clearInterval(showInterval);
    }
  }, [puzzleStarted, puzzleComplete, showingPattern, puzzlePattern]);

  const resetRPS = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setGameResult(null);
    setRpsMessage('Choose rock, paper, or scissors to play!');
    setGameActive(false);
  };

  const resetRPSScores = () => {
    setPlayerScore(0);
    setComputerScore(0);
    resetRPS();
  };

  useEffect(() => {
    if (!wordGameActive) return;
    if (wordTimer <= 0) {
      endWordGame();
      return;
    }

    const timer = window.setInterval(() => {
      setWordTimer((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [wordGameActive, wordTimer, endWordGame]);

  useEffect(() => {
    if (!salesActive) return;
    if (salesTimeLeft <= 0) {
      endSalesGame();
      return;
    }

    const timer = window.setInterval(() => {
      setSalesTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [salesActive, salesTimeLeft, endSalesGame]);

  const updateAviatorBet = (value: string) => {
    setAviatorBetInput(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= aviatorMinBet && numValue <= aviatorMaxBet) {
      setAviatorBet(numValue);
    }
  };

  const startAviatorGame = () => {
    if (!aviatorCanPlay) {
      return;
    }

    const crashPoint = Math.random() * (8 - 1.00) + 1.00;
    setAviatorCrashPoint(crashPoint);
    setAviatorMultiplier(1.00);
    setAviatorGameActive(true);
    setAviatorCashedOut(false);
    setAviatorCrashed(false);
    setAviatorWinnings(0);
    setAviatorPlaneX(0);
    setAviatorGameId(Date.now().toString());
    setAviatorMessage(`Plane is taking off! Will crash at ${crashPoint.toFixed(2)}x... can you cash out in time?`);
  };

  const cashOutAviator = () => {
    if (!aviatorGameActive || aviatorCashedOut || aviatorCrashed) return;

    const finalMultiplier = aviatorMultiplier;
    const winnings = Math.floor(aviatorBet * finalMultiplier);
    setAviatorWinnings(winnings);
    setAviatorCashedOut(true);
    setAviatorGameActive(false);
    setAviatorMessage(`🎉 Cashed out at ${finalMultiplier.toFixed(2)}x! You won ₦${winnings}!`);
    void saveGameScore('Vault Run', winnings);
    console.log('Aviator game result:', {
      game: 'Vault Run',
      quest: 'Cash out the plane before it crashes',
      result: 'Cashed out successfully',
      points: winnings,
      multiplier: finalMultiplier,
    });
  };

  const checkTicTacToeWinner = (board: (string | null)[]) => {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const reportTicTacToe = (victory: boolean, draw = false) => {
    const points = victory ? 120 : draw ? 30 : 10;
    
    // Save score to user profile if authenticated and won or drew
    if (victory || draw) {
      void saveGameScore('Tic-Tac-Toe', points);
    }
    
    console.log('Tic-Tac-Toe game result:', {
      game: 'Tic-Tac-Toe',
      quest: 'Outplay the AI in a classic X/O match',
      result: draw ? 'Draw' : victory ? 'Victory over the AI' : 'Defeat by the AI',
      points: points,
    });
  };

  const resetTicTacToe = () => {
    setTicTacToeBoard(Array(9).fill(null));
    setTicTacToeTurn('X');
    setTicTacToeResult(null);
  };

  const handleTicTacToeMove = (index: number) => {
    if (ticTacToeResult || ticTacToeBoard[index]) return;
    const nextBoard = [...ticTacToeBoard];
    nextBoard[index] = 'X';
    const winner = checkTicTacToeWinner(nextBoard);

    if (winner || nextBoard.every(Boolean)) {
      const isDraw = !winner;
      setTicTacToeBoard(nextBoard);
      setTicTacToeResult(isDraw ? 'Draw!' : 'You win!');
      reportTicTacToe(Boolean(winner) && !isDraw, isDraw);
      return;
    }

    setTicTacToeBoard(nextBoard);
    setTicTacToeTurn('O');

    window.setTimeout(() => {
      const emptyCells = nextBoard.map((cell, idx) => (cell ? null : idx)).filter((item) => item !== null) as number[];
      if (!emptyCells.length) return;
      const aiMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      nextBoard[aiMove] = 'O';
      const aiWinner = checkTicTacToeWinner(nextBoard);
      if (aiWinner || nextBoard.every(Boolean)) {
        const isDraw = !aiWinner;
        setTicTacToeBoard(nextBoard);
        setTicTacToeResult(isDraw ? 'Draw!' : 'AI wins.');
        reportTicTacToe(false, isDraw);
        return;
      }
      setTicTacToeBoard(nextBoard);
      setTicTacToeTurn('X');
    }, 400);
  };

  const getRandomWord = () => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

  const startWordGame = () => {
    setWordGameActive(true);
    setWordTimer(300);
    setWordScore(0);
    setWordMessage('Type the word shown before time runs out. Each correct word earns 2 points.');
    setWordTarget(getRandomWord());
    setWordInput('');
  };

  const submitWord = (event: FormEvent) => {
    event.preventDefault();
    if (!wordGameActive) return;
    if (wordInput.trim().toLowerCase() === wordTarget.toLowerCase()) {
      setWordScore((prev) => prev + 2);
      setWordMessage('✅ Correct! Keep the streak going.');
      setWordTarget(getRandomWord());
      setWordInput('');
      return;
    }
    setWordMessage('❌ That was not the right word. Try the next one!');
    setWordInput('');
  };

  const startSalesGame = () => {
    setSalesActive(true);
    setSalesTimeLeft(30);
    setSalesScore(0);
    setSalesMessage('Tap the correct product to complete the sale. Each successful sale earns 10 points.');
    setSalesTarget(SALES_PRODUCTS[Math.floor(Math.random() * SALES_PRODUCTS.length)]);
  };

  const submitSale = (product: { name: string; emoji: string }) => {
    if (!salesActive) return;
    if (product.name === salesTarget.name) {
      setSalesScore((prev) => prev + 10);
      setSalesMessage(`✅ Sold ${product.name}! Keep moving.`);
      setSalesTarget(SALES_PRODUCTS[Math.floor(Math.random() * SALES_PRODUCTS.length)]);
      return;
    }
    setSalesMessage(`❌ Wrong item. The customer wanted ${salesTarget.name}.`);
  };

  const reportPuzzleGame = (victory: boolean) => {
    const points = victory ? puzzleRound * 40 : puzzleRound * 10;
    
    // Save score to user profile if authenticated and won
    if (victory) {
      void saveGameScore('Gem Puzzle', points);
    }
    
    console.log('Puzzle game result:', {
      game: 'Gem Puzzle',
      quest: 'Complete pattern matching rounds',
      result: victory ? `Round ${puzzleRound} completed!` : 'Pattern failed',
      points: points,
    });
  };

  const startPuzzleGame = () => {
    setPuzzleRound(1);
    setPuzzlePattern(PUZZLE_PATTERNS[0]);
    setPlayerSequence([]);
    setPuzzleStarted(true);
    setPuzzleComplete(false);
    setRoundsCompleted(0);
    setShowingPattern(true);
    setPuzzleMessage('Watch the pattern carefully...');
  };

  const selectGem = (gem: string) => {
    if (!puzzleStarted || puzzleComplete || showingPattern) return;

    const newSequence = [...playerSequence, gem];
    setPlayerSequence(newSequence);

    // Check if sequence matches pattern
    const currentPattern = PUZZLE_PATTERNS[puzzleRound - 1];
    if (newSequence.length === currentPattern.length) {
      const isCorrect = newSequence.every((gem, index) => gem === currentPattern[index]);

      if (isCorrect) {
        setRoundsCompleted(prev => prev + 1);
        if (puzzleRound >= PUZZLE_PATTERNS.length) {
          // Game complete
          setPuzzleComplete(true);
          setPuzzleMessage('🎉 Congratulations! All rounds completed!');
          reportPuzzleGame(true);
        } else {
          // Next round
          setPuzzleRound(prev => prev + 1);
          setPuzzlePattern(PUZZLE_PATTERNS[puzzleRound]);
          setPlayerSequence([]);
          setShowingPattern(true);
          setPuzzleMessage(`Round ${puzzleRound + 1} - Watch the new pattern...`);
        }
      } else {
        // Wrong sequence
        setPuzzleComplete(true);
        setPuzzleMessage('❌ Wrong sequence! Try again next time.');
        reportPuzzleGame(false);
      }
    }
  };

  const openLoot = () => {
    if (lootSpinning) return;
    setLootSpinning(true);
    setLootResult(null);
    const prize = LOOT_PRIZES[Math.floor(Math.random() * LOOT_PRIZES.length)];
    setLootPoints(prize.points);

    setTimeout(() => {
      setLootResult(prize.name);
      setLootSpinning(false);
      
      // Save score to user profile if authenticated
      void saveGameScore('Vault Run', prize.points);
      
      console.log('Loot game result:', {
        game: 'Vault Run',
        quest: 'Crack the vault and obtain a high-tier reward',
        result: `Found ${prize.name}`,
        points: prize.points,
      });
    }, 1500);
  };

  const bossAttack = () => {
    if (battleOver) return;
    const playerDamage = Math.floor(Math.random() * 20) + 12;
    const nextBossHealth = Math.max(bossHealth - playerDamage, 0);
    setBossHealth(nextBossHealth);
    setBattleMessage(`You strike the boss for ${playerDamage} damage.`);

    if (nextBossHealth <= 0) {
      setBattleMessage('The boss is down! You completed the siege mission.');
      setBattleOver(true);
      reportBossResult(true);
      return;
    }

    const bossDamage = Math.floor(Math.random() * 18) + 7;
    const nextPlayerHealth = Math.max(playerHealth - bossDamage, 0);
    setPlayerHealth(nextPlayerHealth);
    setBattleMessage((prev) => `${prev} The sentinel hits back for ${bossDamage}.`);

    if (nextPlayerHealth <= 0) {
      setBattleMessage('You were defeated. Retreat and try again.');
      setBattleOver(true);
      reportBossResult(false);
    }
  };

  const reportBossResult = (victory: boolean) => {
    const points = victory ? 150 : 30;
    
    // Save score to user profile if authenticated and won
    if (victory) {
      void saveGameScore('Boss Siege', points);
    }
    
    console.log('Boss game result:', {
      game: 'Boss Siege',
      quest: 'Destroy the sentinel and defend the stronghold',
      result: victory ? 'Siege Victory' : 'Siege Defeat',
      points: points,
    });
  };

  const resetBattle = () => {
    setBossHealth(100);
    setPlayerHealth(100);
    setBattleMessage('Defeat the sentinel and protect the stronghold.');
    setBattleOver(false);
  };

  const bossCardClass = useMemo(() => {
    if (battleOver && bossHealth === 0) return 'border-emerald-400 bg-slate-900/90';
    if (battleOver && playerHealth === 0) return 'border-red-500 bg-slate-900/90';
    return 'border-emerald-500 bg-green-950/90';
  }, [battleOver, bossHealth, playerHealth]);

  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3" style={{ perspective: 1500 }}>
      <div className="relative overflow-hidden rounded-3xl border border-blue-500 bg-gradient-to-br from-slate-950 via-black to-slate-900 p-8 shadow-2xl shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-blue-500/40 card-hover group">
        <div className="absolute inset-x-8 top-0 h-32 rounded-b-3xl bg-gradient-to-b from-blue-400/20 to-transparent" />
        <div className="relative transform-gpu">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-green-400">Classic Game</p>
              <h3 className="text-3xl font-bold text-white mt-2">Rock Paper Scissors</h3>
            </div>
            <div className="rounded-full bg-blue-600/20 px-4 py-2 text-sm uppercase tracking-[0.2em] text-blue-300 border border-blue-500/50">
              Strategy
            </div>
          </div>
          <p className="text-green-200 leading-relaxed mb-6">Challenge the computer in this timeless game. Beat the AI and secure your streak.</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {(['rock', 'paper', 'scissors'] as const).map((choice) => (
              <button
                key={choice}
                onClick={() => playRPS(choice)}
                disabled={gameActive}
                className={`rounded-2xl py-4 font-bold text-lg transition-all transform ${
                  playerChoice === choice
                    ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/50'
                    : 'bg-slate-900 text-green-200 border border-blue-600/30 hover:border-blue-400 hover:-translate-y-1'
                } disabled:opacity-50`}
              >
                {choice === 'rock' ? '🪨' : choice === 'paper' ? '📄' : '✂️'}
                <div className="text-sm mt-1 capitalize">{choice}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-black/70 p-4 mb-4 ring-1 ring-blue-500/30">
            <div className="text-center">
              <p className="text-xs uppercase text-blue-400 mb-1">Your Choice</p>
              <p className="text-3xl">{playerChoice === 'rock' ? '🪨' : playerChoice === 'paper' ? '📄' : playerChoice === 'scissors' ? '✂️' : '❓'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-400 mb-1">Computer Choice</p>
              <p className="text-3xl">{computerChoice === 'rock' ? '🪨' : computerChoice === 'paper' ? '📄' : computerChoice === 'scissors' ? '✂️' : '❓'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-black/70 p-4 text-green-100 ring-1 ring-blue-500/50 mb-4">
            <div className="text-center">
              <p className="text-xs uppercase text-blue-400 mb-1">Your Score</p>
              <p className="text-2xl font-bold text-white">{playerScore}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-400 mb-1">Computer Score</p>
              <p className="text-2xl font-bold text-white">{computerScore}</p>
            </div>
          </div>

          <p className="text-blue-300 text-center font-medium text-sm mb-4 h-6">{rpsMessage}</p>

          <button
            onClick={resetRPSScores}
            className="w-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 px-6 py-3 font-bold text-black shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:scale-105"
          >
            🔄 New Game
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-green-500 bg-gradient-to-br from-slate-950 via-black to-slate-900 p-8 shadow-2xl shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-purple-500/40 card-hover group">
        <div className="absolute inset-x-8 top-0 h-32 rounded-b-3xl bg-gradient-to-b from-purple-400/20 to-transparent" />
        <div className="relative transform-gpu">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-green-400">Gem Puzzle</p>
              <h3 className="text-3xl font-bold text-white mt-2">Pattern Master</h3>
            </div>
            <div className="rounded-full bg-purple-600/20 px-4 py-2 text-sm uppercase tracking-[0.2em] text-purple-300 border border-purple-500/50">
              Puzzle
            </div>
          </div>
          <p className="text-green-200 leading-relaxed mb-6">Test your memory! Watch the gem pattern, then click the gems in the exact same order. Complete all rounds to win!</p>
          <div className="space-y-4">
            <button
              onClick={startPuzzleGame}
              className="w-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600 px-6 py-4 text-black font-bold text-lg shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-purple-500/50"
            >
              {puzzleComplete ? '🔄 New Game' : '💎 Start Puzzle'}
            </button>

            {/* Pattern display */}
            {puzzleStarted && (
              <div className="bg-black/50 rounded-2xl p-4">
                <div className="text-center mb-4">
                  <p className="text-purple-300 font-medium">Round {puzzleRound}</p>
                  <p className="text-green-400 text-sm">Rounds Completed: {roundsCompleted}</p>
                </div>

                {showingPattern && (
                  <div className="flex justify-center gap-2 mb-4">
                    {puzzlePattern.map((gem, index) => (
                      <div
                        key={index}
                        className="text-3xl animate-pulse"
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        {gem}
                      </div>
                    ))}
                  </div>
                )}

                {!showingPattern && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {PUZZLE_PIECES.map((gem) => (
                      <button
                        key={gem}
                        onClick={() => selectGem(gem)}
                        className="aspect-square rounded-xl bg-slate-800 hover:bg-slate-700 transition-all transform hover:scale-110 text-2xl border border-purple-500/30 hover:border-purple-400"
                      >
                        {gem}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-center">
                  <p className="text-purple-300 text-sm mb-2">Your Sequence:</p>
                  <div className="flex justify-center gap-1 flex-wrap">
                    {playerSequence.map((gem, index) => (
                      <span key={index} className="text-xl">{gem}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-slate-950/90 p-4 text-center text-green-100 ring-1 ring-purple-500/40 min-h-[60px] flex items-center justify-center">
              <p className="text-purple-300 text-sm">{puzzleMessage}</p>
            </div>

            {puzzleComplete && roundsCompleted === PUZZLE_PATTERNS.length && (
              <div className="rounded-2xl bg-green-900/80 p-6 text-center text-green-100 border border-green-500/50 animate-pulse-glow">
                <p className="text-3xl font-bold mb-2">🎉 Master!</p>
                <p className="text-green-200">All puzzle rounds completed perfectly!</p>
              </div>
            )}
            {puzzleComplete && roundsCompleted < PUZZLE_PATTERNS.length && (
              <div className="rounded-2xl bg-red-900/80 p-6 text-center text-red-100 border border-red-500/50">
                <p className="text-2xl font-bold mb-2">❌ Try Again</p>
                <p className="text-red-200">Complete all rounds to become a Pattern Master!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-3xl border p-8 shadow-2xl transition-all duration-500 hover:-translate-y-2 card-hover group text-green-100 ${bossCardClass}`}>
        <div className="absolute inset-x-8 top-0 h-32 rounded-b-3xl bg-gradient-to-b from-lime-400/20 to-transparent" />
        <div className="relative transform-gpu">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-green-400">Boss Siege</p>
              <h3 className="text-3xl font-bold text-white mt-2">Stronghold Clash</h3>
            </div>
            <div className="rounded-full bg-lime-600/20 px-4 py-2 text-sm uppercase tracking-[0.2em] text-lime-300 border border-lime-500/50">
              Boss
            </div>
          </div>
          <p className="text-green-200 leading-relaxed mb-6">Breach the stronghold, defeat the sentinel, and claim your place among the elite.</p>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-950/90 p-4 ring-1 ring-green-500/40">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-green-300 font-medium">Player Health</p>
                  <span className="text-white font-bold">{playerHealth}%</span>
                </div>
                <div className="h-4 w-full rounded-full bg-green-900/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                    style={{ width: `${playerHealth}%` }}
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-950/90 p-4 ring-1 ring-red-500/40">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-red-300 font-medium">Boss Health</p>
                  <span className="text-white font-bold">{bossHealth}%</span>
                </div>
                <div className="h-4 w-full rounded-full bg-red-900/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                    style={{ width: `${bossHealth}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={bossAttack}
                disabled={battleOver}
                className="w-full rounded-full bg-gradient-to-r from-lime-400 to-lime-600 px-6 py-4 font-bold text-black text-lg shadow-lg shadow-lime-500/30 transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-lime-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⚔️ Attack Boss
              </button>
              <button
                onClick={resetBattle}
                className="w-full rounded-full bg-slate-800 px-6 py-3 font-semibold text-green-200 hover:bg-slate-700 transition-all hover:scale-105 border border-green-600/50"
              >
                🔄 Reset Siege
              </button>
            </div>
            <p className="text-green-300 text-center font-medium min-h-[3rem] flex items-center justify-center">{battleMessage}</p>
            {battleOver && bossHealth === 0 && (
              <div className="rounded-2xl bg-green-900/80 p-6 text-center text-green-100 border border-green-500/50 animate-pulse-glow">
                <p className="text-2xl font-bold mb-2">🏆 Stronghold Cleared!</p>
                <p className="text-green-200">Your victory boosts your performance rank.</p>
              </div>
            )}
            {battleOver && playerHealth === 0 && (
              <div className="rounded-2xl bg-red-900/80 p-6 text-center text-red-100 border border-red-500/50">
                <p className="text-2xl font-bold mb-2">💀 Retreat...</p>
                <p className="text-red-200">Return, rebuild, and retry the mission.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-pink-500 bg-gradient-to-br from-slate-950 via-black to-slate-900 p-8 shadow-2xl shadow-pink-500/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-pink-500/40 card-hover group">
        <div className="absolute inset-x-8 top-0 h-32 rounded-b-3xl bg-gradient-to-b from-pink-400/20 to-transparent" />
        <div className="relative transform-gpu">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-green-400">Tic-Tac-Toe</p>
              <h3 className="text-3xl font-bold text-white mt-2">Neon X/O</h3>
            </div>
            <div className="rounded-full bg-pink-600/20 px-4 py-2 text-sm uppercase tracking-[0.2em] text-pink-300 border border-pink-500/50">
              Strategy
            </div>
          </div>
          <p className="text-green-200 leading-relaxed mb-6">Challenge the AI in a neon X/O showdown. Block lines, score wins, and sharpen your strategy.</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {ticTacToeBoard.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleTicTacToeMove(index)}
                className={`aspect-square rounded-2xl border text-3xl font-bold transition-all ${cell ? 'bg-pink-500/20 border-pink-400 text-white' : 'bg-slate-900 border-pink-600/30 text-pink-200 hover:bg-slate-800 hover:border-pink-300'}`}
              >
                {cell}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-black/70 p-4 text-green-100 ring-1 ring-pink-500/30">
            <div className="text-center">
              <p className="text-xs uppercase text-green-400 mb-1">Result</p>
              <p className="text-lg font-semibold text-white">{ticTacToeResult || 'In progress'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-green-400 mb-1">AI Turn</p>
              <p className="text-lg font-semibold text-white">{ticTacToeTurn}</p>
            </div>
          </div>
          <button
            onClick={resetTicTacToe}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600 px-5 py-3 font-bold text-black shadow-lg shadow-pink-500/30 hover:-translate-y-1 hover:scale-105"
          >
            🔄 Reset Match
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-cyan-500 bg-gradient-to-br from-slate-950 via-black to-slate-900 p-8 shadow-2xl shadow-cyan-500/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-cyan-500/40 card-hover group">
        <div className="absolute inset-x-8 top-0 h-32 rounded-b-3xl bg-gradient-to-b from-cyan-400/20 to-transparent" />
        <div className="relative transform-gpu">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-green-400">Word Rush</p>
              <h3 className="text-3xl font-bold text-white mt-2">5-Minute Sprint</h3>
            </div>
            <div className="rounded-full bg-cyan-600/20 px-4 py-2 text-sm uppercase tracking-[0.2em] text-cyan-300 border border-cyan-500/50">
              Typing
            </div>
          </div>
          <p className="text-green-200 leading-relaxed mb-6">Finish as many target words as possible in five minutes. Each correct word is worth 2 points.</p>
          <div className="rounded-3xl bg-slate-900/90 p-5 mb-4 ring-1 ring-cyan-500/30">
            <p className="text-sm text-cyan-300 uppercase tracking-[0.2em] mb-2">Time left</p>
            <p className="text-4xl font-bold text-white">{Math.floor(wordTimer / 60)}:{String(wordTimer % 60).padStart(2, '0')}</p>
          </div>
          <div className="rounded-3xl bg-black/70 p-5 mb-4 text-center text-white">
            <p className="text-2xl font-bold mb-2">{wordTarget || 'Ready?'}</p>
            <p className="text-sm text-cyan-300">Type the current word and submit to score.</p>
          </div>
          <form onSubmit={submitWord} className="space-y-3">
            <input
              type="text"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              className="w-full rounded-2xl border border-cyan-500 bg-slate-900/90 p-3 text-green-100 placeholder:text-green-500"
              placeholder="Type the word here"
              disabled={!wordGameActive}
            />
            <button
              type="submit"
              disabled={!wordGameActive}
              className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-5 py-3 font-bold text-black shadow-lg shadow-cyan-500/30 hover:-translate-y-1 hover:scale-105 disabled:opacity-50"
            >
              {wordGameActive ? 'Submit Word' : 'Start Word Rush'}
            </button>
          </form>
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl bg-black/70 p-4 text-green-100 ring-1 ring-cyan-500/30">
            <div className="text-center">
              <p className="text-xs uppercase text-green-400 mb-1">Words</p>
              <p className="text-lg font-semibold text-white">{Math.floor(wordScore / 2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-green-400 mb-1">Points</p>
              <p className="text-lg font-semibold text-white">{wordScore}</p>
            </div>
          </div>
          <button
            onClick={startWordGame}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-5 py-3 font-bold text-black shadow-lg shadow-cyan-500/30 hover:-translate-y-1 hover:scale-105"
          >
            🚀 Start Sprint
          </button>
          <p className="mt-3 text-center text-sm text-cyan-300">{wordMessage}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-orange-500 bg-gradient-to-br from-slate-950 via-black to-slate-900 p-8 shadow-2xl shadow-orange-500/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-orange-500/40 card-hover group">
        <div className="absolute inset-x-8 top-0 h-32 rounded-b-3xl bg-gradient-to-b from-orange-400/20 to-transparent" />
        <div className="relative transform-gpu">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-green-400">Market Sprint</p>
              <h3 className="text-3xl font-bold text-white mt-2">Sales Rush</h3>
            </div>
            <div className="rounded-full bg-orange-600/20 px-4 py-2 text-sm uppercase tracking-[0.2em] text-orange-300 border border-orange-500/50">
              Retail
            </div>
          </div>
          <p className="text-green-200 leading-relaxed mb-6">Process as many sales as possible before time runs out. Match the right item and win big points.</p>
          <div className="rounded-3xl bg-slate-900/90 p-5 mb-4 ring-1 ring-orange-500/30">
            <p className="text-sm text-orange-300 uppercase tracking-[0.2em] mb-2">Current order</p>
            <p className="text-3xl font-bold text-white">{salesTarget.emoji} {salesTarget.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {SALES_PRODUCTS.map((product) => (
              <button
                key={product.name}
                onClick={() => submitSale(product)}
                disabled={!salesActive}
                className="rounded-2xl bg-black/70 p-4 text-center text-2xl text-white border border-orange-500/20 transition-all hover:bg-slate-800 disabled:opacity-50"
              >
                {product.emoji}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-black/70 p-4 text-green-100 ring-1 ring-orange-500/30">
            <div className="text-center">
              <p className="text-xs uppercase text-green-400 mb-1">Time</p>
              <p className="text-lg font-semibold text-white">{salesTimeLeft}s</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-green-400 mb-1">Score</p>
              <p className="text-lg font-semibold text-white">{salesScore}</p>
            </div>
          </div>
          <button
            onClick={startSalesGame}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 px-5 py-3 font-bold text-black shadow-lg shadow-orange-500/30 hover:-translate-y-1 hover:scale-105"
          >
            🛒 Start Sales Rush
          </button>
          <p className="mt-3 text-center text-sm text-orange-300">{salesMessage}</p>
        </div>
      </div>
    </div>
  );
}
