import { useState } from 'react';

function Square({
  value,
  onSquareClick,
  isHighlighted,
}: {
  value: string | null;
  onSquareClick: () => void;
  isHighlighted?: boolean;
}) {

  return <button className={`square${isHighlighted ? " square-highlight" : ""}`} onClick={onSquareClick}>{value}</button>;
}

function Board({
  xIsNext,
  squares,
  onPlay,}: {xIsNext: boolean; squares: (string | null)[]; onPlay: (nextSquares: (string | null)[]) => void;}) {

  const { winner, line: winningLine } = calculateWinner(squares);
  const isBoardFull = squares.every((square) => square !== null);

  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (isBoardFull) {
    status = "Draw: No more moves left.";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }
  

  function handleClick(i: number) {
    const { winner } = calculateWinner(squares);
  
    if (squares[i] || winner) {
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

  

  const board = [];
  for (let row = 0; row < 3; row++) {
    const squaresInRow = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const isHighlighted =
        !!winningLine && winningLine.includes(index);
      squaresInRow.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          isHighlighted={isHighlighted}
        />
      );
    }
    board.push(
      <div key={row} className="board-row">
        {squaresInRow}
      </div>
    );
  }

  return (

      <>
        <div className="status">{status}</div>
        {board}
      </>
      

  )
  
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
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }

  return { winner: null, line: null };
}


export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const [isAscending, setIsAscending] = useState<boolean>(true);


  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    let location = '';

    if (move > 0) {
      const prevSquares = history[move - 1];
      let moveIndex = -1;

      for (let i = 0; i < squares.length; i++) {
        if (prevSquares[i] !== squares[i]) {
          moveIndex = i;
          break;
        }
      }

      if (moveIndex !== -1) {
        const row = Math.floor(moveIndex / 3) + 1; 
        const col = (moveIndex % 3) + 1;          
        location = ` (${row}, ${col})`;
      }
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        {move === currentMove ? (
          <span>
            You are at move #{move}
            {location}
          </span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });


  

  const orderedMoves = isAscending ? moves : [...moves].reverse();


  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
      </div>
      <div className="game-info">
        <button onClick={() => setIsAscending(!isAscending)}>
          {isAscending ? "Sort Descending" : "Sort Ascending"}
        </button>

        <ol>{orderedMoves}</ol>
      </div>
    </div>
  );
}