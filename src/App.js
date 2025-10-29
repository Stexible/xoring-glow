import React, { useState, useEffect, useCallback } from 'react';
import Leaderboard from './Leaderboard';
import './App.css';

const FIELD_SIZES = {
  easy: { rows: 8, cols: 5 },       // Легко: 8 рядов, 5 колонок (ориентация изменена)
  normal: { rows: 10, cols: 5 },    // Нормально: 10 рядов, 5 колонок (новый режим)
  hard: { rows: 8, cols: 10 },      // Сложно (бывший classic): 8 рядов, 10 колонок
  pro: { rows: 10, cols: 15 },      // Профессионал (бывший extended): 10 рядов, 15 колонок
};

const MAX_LEADERBOARD_ENTRIES = 10;

// Функция для определения начального количества очков в зависимости от режима
const getInitialScoreForMode = (mode) => {
  switch (mode) {
    case 'easy':
      return 30; // Легко
    case 'normal':
      return 60; // Нормально
    case 'hard':
      return 130; // Сложно
    case 'pro':
      return 200; // Профессионал
    default:
      return 30; // Значение по умолчанию
  }
};

// Функция для генерации случайного поля
const generateRandomField = (rows, cols) => {
  const field = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() < 0.5) // 50% шанс быть нажатой
  );
  // Можно добавить более точную регулировку % нажатых кнопок здесь
  return field;
};

// Функция для проверки, все ли кнопки отжаты
const checkWin = (field) => {
  return field.every(row => row.every(cell => !cell));
};

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null); // 'easy', 'normal', 'hard' или 'pro'
  const [field, setField] = useState([]);
  const [score, setScore] = useState(0); // Изначально 0, будет установлено при старте
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Загрузка лидерборда из localStorage при старте
  useEffect(() => {
    const savedLeaderboard = JSON.parse(localStorage.getItem('xoringGlowLeaderboard')) || [];
    setLeaderboard(savedLeaderboard);
  }, []);

  // Сохранение лидерборда в localStorage (использовал useCallback для стабильности)
  const saveLeaderboard = useCallback((newLeaderboard) => {
    localStorage.setItem('xoringGlowLeaderboard', JSON.stringify(newLeaderboard));
    setLeaderboard(newLeaderboard);
  }, []);

  const startGame = (mode) => {
    setGameMode(mode);
    const { rows, cols } = FIELD_SIZES[mode];
    setField(generateRandomField(rows, cols));
    setScore(getInitialScoreForMode(mode)); // Устанавливаем очки в зависимости от режима
    setGameOver(false);
    setGameStarted(true);
    setShowLeaderboard(false);
  };

  const handleCellClick = (rowIndex, colIndex) => {
    if (gameOver) return;

    setScore(prevScore => prevScore - 1); // Снимаем одно очко

    setField(prevField => {
      const newField = prevField.map(row => [...row]); // Копируем поле
      const { rows, cols } = FIELD_SIZES[gameMode];

      // Функция для переключения состояния ячейки
      const toggleCell = (r, c) => {
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          newField[r][c] = !newField[r][c];
        }
      };

      // **Теперь во всех режимах переключается сама кнопка и её соседи**
      toggleCell(rowIndex, colIndex); // Сама кнопка
      toggleCell(rowIndex - 1, colIndex); // Вверх
      toggleCell(rowIndex + 1, colIndex); // Вниз
      toggleCell(rowIndex, colIndex - 1); // Влево
      toggleCell(rowIndex, colIndex + 1); // Вправо
      
      return newField;
    });
  };

  // Проверка на выигрыш и конец игры
  useEffect(() => {
    if (gameStarted && !gameOver) {
      if (checkWin(field)) {
        setGameOver(true);
        if (score > 0) {
          alert(`Поздравляем, ${playerName}! Вы выиграли с ${score} очками!`);
          const newLeaderboardEntry = { name: playerName, score: score, date: new Date().toLocaleDateString() };
          const updatedLeaderboard = [...leaderboard, newLeaderboardEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_LEADERBOARD_ENTRIES);
          saveLeaderboard(updatedLeaderboard);
        } else {
          alert(`Вы выиграли, ${playerName}, но без очков. Попробуйте снова!`);
        }
      }
    }
  }, [field, gameStarted, gameOver, score, playerName, leaderboard, saveLeaderboard]);

  const handleRestart = () => {
    setGameStarted(false);
    setGameOver(false);
    setPlayerName(''); // Сброс имени для нового игрока
    setGameMode(null);
  }

  // Функция для получения отображаемого названия режима
  const getDisplayModeName = (mode) => {
    switch(mode) {
      case 'easy': return 'Легко';
      case 'normal': return 'Нормально';
      case 'hard': return 'Сложно';
      case 'pro': return 'Профессионал';
      default: return 'Неизвестно';
    }
  }

  return (
    <div className="app-container">
      <h1 className="game-title">Xoring Glow</h1>

      {!gameStarted && !showLeaderboard && (
        <div className="main-menu glass-panel">
          <input
            type="text"
            className="player-name-input glass-input"
            placeholder="Введите ваше имя"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button className="glass-button" onClick={() => startGame('easy')} disabled={!playerName}>
            Легко (8x5)
          </button>
          <button className="glass-button" onClick={() => startGame('normal')} disabled={!playerName}>
            Нормально (10x5)
          </button>
          <button className="glass-button" onClick={() => startGame('hard')} disabled={!playerName}>
            Сложно (8x10)
          </button>
          <button className="glass-button" onClick={() => startGame('pro')} disabled={!playerName}>
            Профессионал (10x15)
          </button>
          <button className="glass-button" onClick={() => setShowLeaderboard(true)}>
            Лидерборд
          </button>
          <p className="instructions-hint">
            Как играть? Цель - отжать все кнопки. При нажатии меняется выбранная кнопка и её соседи.
          </p>
        </div>
      )}

      {showLeaderboard && (
        <div className="leaderboard-view">
          <Leaderboard entries={leaderboard} />
          <button className="glass-button" onClick={() => setShowLeaderboard(false)}>
            Назад в меню
          </button>
        </div>
      )}

      {gameStarted && (
        <div className="game-area">
          <div className="game-info glass-panel">
            <p>Игрок: <span className="highlight">{playerName}</span></p>
            <p>Очки: <span className={`highlight ${score <= 5 && score > 0 ? 'warning-score' : ''} ${score <= 0 ? 'zero-score' : ''}`}>{score}</span></p>
            <p>Режим: <span className="highlight">{getDisplayModeName(gameMode)}</span></p>
          </div>

          <div className={`game-field ${gameMode === 'easy' ? 'easy-field' : gameMode === 'normal' ? 'normal-field' : gameMode === 'hard' ? 'hard-field' : 'pro-field'}`}>
            {field.map((row, rowIndex) => (
              <div key={rowIndex} className="field-row">
                {row.map((cellState, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={`game-cell ${cellState ? 'active' : ''} ${gameOver ? 'game-over' : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={gameOver}
                  >
                    {/* Визуальное содержимое кнопки, если нужно, пока пусто */}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button className="glass-button restart-button" onClick={handleRestart}>
            Новая игра / В меню
          </button>
        </div>
      )}
    </div>
  );
}

export default App;