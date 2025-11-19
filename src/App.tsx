import { useState } from 'react';

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
  style?: React.CSSProperties;
}

function Square({ value, onSquareClick, style }: SquareProps) {
  return (
    <button className="square" onClick={onSquareClick} style={style}>
      {value}
    </button>
  );
}

type BoardProps = {
  xIsNext: boolean;
  squares: ('X' | 'O' | null)[];
  onPlay: (nextSquares: ('X' | 'O' | null)[]) => void;
}

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winnerResults = calculateWinner(squares);
  const winningSquares = winnerResults?.line;
  const winner = winnerResults?.winner;
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.every(squares => squares != null)) {
    status = 'Draw';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const createSquares = [];
  for (let i = 0; i < 3; i++) {
    const squareValues = [];
    for (let j=0; j < 3; j++) {
        squareValues.push(
          <Square 
            key = {i * 3 + j} 
            value={squares[i * 3 + j]} 
            onSquareClick={() => handleClick(i * 3 + j)} 
            style={{
              backgroundColor: winningSquares?.includes(i * 3 + j) ? 'yellow' : 'white'
            }}
          />
        );
      }
    createSquares.push(
      <div key={i} className="board-row">
        {squareValues}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div> 
      {createSquares}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 == 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: ('X' | 'O' | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      const lastMove = squares.findIndex(
        (val, idx) => val !== history[move - 1][idx]
      );
      const row = Math.floor(lastMove / 3) + 1;
      const col = (lastMove % 3) + 1;
      description = 'Go to move #' + move + ` (${row}, ${col})`;
    } else {
      description = 'Go to game start';
    }

    return (
      <li key={move}>
        {move === currentMove ? (
          <span style={{fontSize: 12, marginLeft: 6}}>{description}</span> 
        ): (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  const [isAscending, setIsAscending] = useState(true);
  const sortedMoves = isAscending ? moves : [...moves].reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={() => setIsAscending(!isAscending)}>
          {isAscending ? 'Sort Descending' : 'Sort Ascending'}
        </button>
        <ol>{sortedMoves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares: ('X' | 'O' | null)[]) {
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
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}