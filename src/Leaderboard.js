import React from 'react';
import './App.css'; // Используем тот же CSS для стилей

function Leaderboard({ entries }) {
  return (
    <div className="leaderboard-container glass-panel">
      <h2>Лидерборд</h2>
      {entries.length === 0 ? (
        <p>Пока нет записей. Станьте первым!</p>
      ) : (
        <ol className="leaderboard-list">
          {entries.map((entry, index) => (
            <li key={index} className="leaderboard-item">
              <span className="leaderboard-name">{entry.name}</span>
              <span className="leaderboard-score">{entry.score} очков</span>
              <span className="leaderboard-date">({entry.date})</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default Leaderboard;