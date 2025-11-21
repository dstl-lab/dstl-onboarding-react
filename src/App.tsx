import { useState } from 'react';

function Square({ value, onSquareClick, isWinning }: { value: string | null; onSquareClick: () => void; isWinning?: boolean }) {
  return (
    <button className={`square ${isWinning ? 'winning' : ''}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }: { xIsNext: boolean; squares: (string | null)[]; onPlay: (squares: (string | null)[], moveIndex: number) => void; }) {
  const { winner, winningLine, isDraw } = calculateWinner(squares);
  
  function handleClick(i: number) {
    if (winner || squares[i] || isDraw) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares, i); // Pass the move index
  }

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (isDraw) {
    status = 'Game ended in a draw!';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const boardRows = [];
  const boardSize = 3;

  for (let row = 0; row < boardSize; row++) {
    const boardRow = [];
    for (let col = 0; col < boardSize; col++) {
      const index = row * boardSize + col;
      const isWinningSquare = winningLine ? winningLine.includes(index) : false;
      boardRow.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          isWinning={isWinningSquare}
        />
      );
    }
    boardRows.push(
      <div key={row} className="board-row">
        {boardRow}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState<{ squares: (string | null)[]; moveLocation?: { row: number; col: number } }[]>([
    { squares: Array(9).fill(null) }
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares: (string | null)[], moveIndex: number) {
    const row = Math.floor(moveIndex / 3);
    const col = moveIndex % 3;
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, moveLocation: { row, col } }
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  let moves = history.map((step, move) => {
    let description;
    let moveLocation = '';
    
    if (move > 0) {
      description = 'Go to move #' + move;
      if (step.moveLocation) {
        moveLocation = ` (${step.moveLocation.row}, ${step.moveLocation.col})`;
      }
    } else {
      description = 'Go to game start';
    }

    if (move === currentMove) {
      return (
        <li key={move}>
          <div>You are at move #{move}{moveLocation}</div>
        </li>
      );
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}{moveLocation}</button>
      </li>
    );
  });

  if (!isAscending) {
    moves = moves.slice().reverse();
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={() => setIsAscending(!isAscending)}>
          Sort: {isAscending ? 'Ascending' : 'Descending'}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningLine: [a, b, c],
        isDraw: false
      };
    }
  }

  // Check for draw (all squares filled and no winner)
  const isDraw = squares.every(square => square !== null);
  
  return {
    winner: null,
    winningLine: null,
    isDraw: isDraw
  };
}