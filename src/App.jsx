// App.js
import React, { useState, useEffect } from "react";
import "./App.css";

const USAJOBS_API_KEY = "MAxiPSFc0DH5mPxNcYas7H8voE0wlL2q9fkPDN70DBI=";
const USAJOBS_HOST = "data.usajobs.gov";

function App() {
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    if (gameStarted) {
      fetchJob();
    }
  }, [gameStarted]);

  const fetchJob = async () => {
    const response = await fetch(
      "https://data.usajobs.gov/api/search?ResultsPerPage=1&Page=" +
        Math.floor(Math.random() * 100),
      {
        headers: {
          Host: USAJOBS_HOST,
          "User-Agent": "your-email@example.com", // Replace with your email
          "Authorization-Key": USAJOBS_API_KEY,
        },
      },
    );
    const data = await response.json();
    setJobs(data.SearchResult.SearchResultItems);
    setCurrentJob(
      data.SearchResult.SearchResultItems[0].MatchedObjectDescriptor,
    );
  };

  const handleGuess = () => {
    const minSalary = parseFloat(
      currentJob.PositionRemuneration[0].MinimumRange.replace(/[^\d.-]/g, ""),
    );
    const maxSalary = parseFloat(
      currentJob.PositionRemuneration[0].MaximumRange.replace(/[^\d.-]/g, ""),
    );

    const userGuess = parseFloat(guess);

    if (userGuess >= minSalary && userGuess <= maxSalary) {
      setScore(score + 1);
      setResultMessage(<p style={{ color: "green" }}>Correct</p>);
    } else {
      setResultMessage(<p style={{ color: "red" }}>Incorrect</p>);
    }

    setShowResult(true);
  };

  const nextJob = () => {
    setShowResult(false);
    setGuess("");
    if (currentJobIndex < 9) {
      setCurrentJobIndex(currentJobIndex + 1);
      fetchJob();
    } else {
      setGameOver(true);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentJobIndex(0);
    setGameOver(false);
  };

  const playAgain = () => {
    setGameStarted(false);
    setShowResult(false);
    setResultMessage("");
  };

  if (!gameStarted) {
    return (
      <div className="App">
        <h1>Guess the Salary</h1>
        <button onClick={startGame}>Start Game</button>
      </div>
    );
  }

  if (jobs.length === 0 || !currentJob) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {gameOver ? (
        <div className="result">
          <h2>Game Over!</h2>
          <p>Your final score is: {score}</p>
          <button onClick={playAgain}>Play Again</button>
        </div>
      ) : (
        <div>
          <h2>{currentJob.PositionTitle}</h2>
          <p>{currentJob.PositionLocationDisplay}</p>
          {!showResult && (
            <>
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess"
              />
              <button onClick={handleGuess}>Submit Guess</button>
            </>
          )}
          {showResult && (
            <div>
              {resultMessage}
              <p>
                Salary Range: ${currentJob.PositionRemuneration[0].MinimumRange}{" "}
                - ${currentJob.PositionRemuneration[0].MaximumRange}
              </p>
              <a
                href={currentJob.ApplyURI[0]}
                target="_blank"
                rel="noopener noreferrer"
              >
                Job Posting Link
              </a>
              <button onClick={nextJob}>Next Posting</button>
            </div>
          )}
          <p>Question: {currentJobIndex + 1} / 10</p>
          <p>Score: {score}</p>
        </div>
      )}
    </div>
  );
}

export default App;
