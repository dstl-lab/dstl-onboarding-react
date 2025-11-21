import { useState } from "react";

function Square({
  value,
  onSquareClick,
  highlight,
}: {
  value: string;
  onSquareClick: () => void;
  highlight: boolean,
}) {
  let color;
  if (highlight) {
    color = "yellow"
  } else {
    color = "white"
  }
  return (
    <button className="square" onClick={onSquareClick} style={{ backgroundColor: color }}>
      {value}
    </button>
  );
}

function Board({
  xIsNext,
  squares,
  onPlay,
}: {
  xIsNext: boolean;
  squares: Array<string>;
  onPlay: (nextSquares: Array<string>) => void;
}) {
  function handleClick(i: number) {
    // Early return if populated already
    const winnerResult = calculateWinner(squares);
    if (squares[i] || (winnerResult && winnerResult.winner && winnerResult.winner !== "tie")) {
      return;
    }

    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }

    onPlay(nextSquares);
  }

  const winnerResult = calculateWinner(squares);
  let status;
  let highlightSquares: number[] = [];
  if (winnerResult && winnerResult.winner === "tie") {
    status = "Tie Game";
  } else if (winnerResult && winnerResult.winner) {
    status = "Winner " + winnerResult.winner;
    highlightSquares = winnerResult.line;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }


  return (
    <>
      <div className="status">{status}</div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="board-row">
          {[0, 1, 2].map((j) => {
            const idx = 3 * i + j;
            return (
              <Square
                key={idx}
                value={squares[idx]}
                onSquareClick={() => handleClick(idx)}
                highlight={highlightSquares.includes(idx)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);

  const xIsNext = currentMove % 2 == 0;
  const currentSquares = history[currentMove];

  const switchOrder = () => {setIsAscending(!isAscending)};

  function handlePlay(nextSquares : Array<string>) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove : number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((_, move) => {
    let description;
    if (move == currentMove) {
      description = `You are at move #` + move;
    }else if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });
  
  if (!isAscending) {
    moves.reverse();
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
        <button onClick={switchOrder}>Sort</button>
      </div>
    </div>
  );
}

function calculateWinner(squares: Array<string>): { winner: string; line: number[] } | { winner: "tie"; line: number[] } | null {
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
      return { winner: squares[a], line: lines[i] };
    }
  }

  // Check for tie (all squares filled, no winner)
  for (let i = 0; i < squares.length; i++) {
    if (!squares[i]) {
      return null;
    }
  }

  return { winner: "tie", line: [] };
}
