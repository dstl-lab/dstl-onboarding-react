// src/Game.tsx
import React, { useState, type JSX } from "react";

type SquareValue = "X" | "O" | null;

interface HistoryEntry {
  squares: SquareValue[];
  movePos: number | null;
}

interface SquareProps {
  value: SquareValue;
  onSquareClick: () => void;
  style?: React.CSSProperties;
}

function Square({ value, onSquareClick, style }: SquareProps): JSX.Element {
  return (
    <button
      className="square"
      onClick={onSquareClick}
      style={{
        width: 40,
        height: 40,
        fontSize: 20,
        marginRight: 8,
        marginBottom: 8,
        ...style,
      }}
      aria-label={`square-${value ?? "empty"}`}
    >
      {value}
    </button>
  );
}

function calculateWinner(squares: SquareValue[]): {
  winner: SquareValue;
  line: number[] | null;
} {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ] as const;

  for (const line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

interface BoardProps {
  squares: SquareValue[];
  onPlay: (nextSquares: SquareValue[], movePos: number) => void;
  xIsNext: boolean;
  winningLine: number[] | null;
}
function Board({
  squares,
  onPlay,
  xIsNext,
  winningLine,
}: BoardProps): JSX.Element {
  function handleClick(i: number) {
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares, i);
  }

  const result = calculateWinner(squares);
  let status: string;
  if (result.winner) {
    status = "Winner: " + result.winner;
  } else if (squares.every((s) => s !== null)) {
    status = "Draw";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  // Render board via two loops (rows and columns)
  const boardRows: JSX.Element[] = [];
  for (let row = 0; row < 3; row++) {
    const cells: JSX.Element[] = [];
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const isWinning = Boolean(winningLine && winningLine.includes(idx));
      cells.push(
        <Square
          key={idx}
          value={squares[idx]}
          onSquareClick={() => handleClick(idx)}
          style={{
            backgroundColor: isWinning ? "yellow" : "white",
            border: "1px solid #999",
            borderRadius: 4,
            cursor: squares[idx] || result.winner ? "default" : "pointer",
          }}
        />
      );
    }
    boardRows.push(
      <div key={row} style={{ display: "flex" }}>
        {cells}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>{status}</div>
      {boardRows}
    </div>
  );
}

export default function Game(): JSX.Element {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { squares: Array<SquareValue>(9).fill(null), movePos: null },
  ]);
  const [currentMove, setCurrentMove] = useState<number>(0);
  const [ascending, setAscending] = useState<boolean>(true); // default order is ascending

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares: SquareValue[], movePos: number) {
    // keep history up to current move (discard "future" if time-traveled)
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, movePos },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  // Build move list with location (row,col), and show text for current move
  const moves = history.map((entry, moveIndex) => {
    const isCurrent = moveIndex === currentMove;
    const desc =
      moveIndex === 0
        ? "Go to game start"
        : `Go to move #${moveIndex} (${formatPos(entry.movePos)})`;

    if (isCurrent) {
      return (
        <li key={moveIndex}>
          <span style={{ fontWeight: 700 }}>You are at move #{moveIndex}</span>
        </li>
      );
    }

    return (
      <li key={moveIndex}>
        <button onClick={() => jumpTo(moveIndex)}>{desc}</button>
      </li>
    );
  });

  const displayedMoves = ascending ? moves : [...moves].reverse();
  const nextLabel = ascending ? "Sort Descending" : "Sort Ascending"; // button shows the next order

  // Determine winning line for current board to pass to Board (highlight)
  const { line: winningLine } = calculateWinner(currentSquares);

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <div>
        <Board
          squares={currentSquares}
          onPlay={handlePlay}
          xIsNext={xIsNext}
          winningLine={winningLine}
        />
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>
          <button onClick={() => setAscending((s) => !s)}>{nextLabel}</button>
        </div>
        <ol>{displayedMoves}</ol>
      </div>
    </div>
  );
}

// Helpers
function formatPos(movePos: number | null): string {
  if (movePos === null) return "-";
  const row = Math.floor(movePos / 3) + 1;
  const col = (movePos % 3) + 1;
  return `${row},${col}`;
}
