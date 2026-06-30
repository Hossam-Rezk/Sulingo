import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/placementQuiz.css"

// Quiz questions: 6 letters from Level 1 + 6 words from Level 2
const QUIZ_QUESTIONS = [
  // Level 1 - Alphabets (images)
  { 
    type: "image",
    letter: "A", 
    media: "/quiz/a.png",
    options: ["A", "B", "E", "F"],
    level: 1
  },
  { 
    type: "image",
    letter: "D", 
    media: "/quiz/d.png",
    options: ["C", "D", "O", "Q"],
    level: 1
  },
  { 
    type: "image",
    letter: "M", 
    media: "/quiz/m.png",
    options: ["N", "M", "W", "H"],
    level: 1
  },
  { 
    type: "image",
    letter: "R", 
    media: "/quiz/r.png",
    options: ["R", "K", "P", "V"],
    level: 1
  },
  { 
    type: "image",
    letter: "Y", 
    media: "/quiz/y.png",
    options: ["I", "J", "Y", "L"],
    level: 1
  },
  { 
    type: "image",
    letter: "Z", 
    media: "/quiz/z.png",
    options: ["X", "Z", "V", "W"],
    level: 1
  },
  
  // Level 2 - Words (videos)
  { 
    type: "video",
    letter: "Hello", 
    media: "/quiz/hello.mp4",
    options: ["Hello", "Yes", "No", "Please"],
    level: 2
  },
  { 
    type: "video",
    letter: "Please", 
    media: "/quiz/please.mp4",
    options: ["Want", "Please", "Sorry", "Good"],
    level: 2
  },
  { 
    type: "video",
    letter: "Eat", 
    media: "/quiz/eat.mp4",
    options: ["Drink", "Sleep", "Eat", "Work"],
    level: 2
  },
  { 
    type: "video",
    letter: "Home", 
    media: "/quiz/home.mp4",
    options: ["School", "Home", "Work", "Bathroom"],
    level: 2
  },
  { 
    type: "video",
    letter: "Morning", 
    media: "/quiz/morning.mp4",
    options: ["Night", "Morning", "Sleep", "Home"],
    level: 2
  },
  { 
    type: "video",
    letter: "Good", 
    media: "/quiz/good.mp4",
    options: ["Good", "Help", "Want", "Sorry"],
    level: 2
  },
]

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function PlacementQuiz() {
  const navigate = useNavigate()
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState([])

  useEffect(() => {
    // Shuffle questions on mount
    setShuffledQuestions(shuffleArray([...QUIZ_QUESTIONS]))
  }, [])

  if (shuffledQuestions.length === 0) {
    return <div className="loadingQuiz">Loading quiz...</div>
  }

  const total = shuffledQuestions.length
  const progress = (currentQuestion / total) * 100
  const question = shuffledQuestions[currentQuestion]

  const handleAnswer = (option) => {
    if (selectedOption) return // Already answered
    
    setSelectedOption(option)
    
    if (option === question.letter) {
      setScore(s => s + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < total - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedOption(null)
    } else {
      setShowResult(true)
    }
  }

  // Calculate suggested level based on score
  const getRecommendedLevel = () => {
    const percentage = (score / total) * 100
    
    if (percentage >= 75) {
      return {
        level: 2,
        title: "Level 2: Words",
        message: "Great job! You have a solid understanding of alphabets. Start with words!",
        emoji: "🌟"
      }
    } else if (percentage >= 40) {
      return {
        level: 1,
        title: "Level 1: Alphabets",
        message: "You know some basics! Let's strengthen your alphabet knowledge first.",
        emoji: "📚"
      }
    } else {
      return {
        level: 1,
        title: "Level 1: Alphabets",
        message: "Perfect! Starting from the basics will give you a strong foundation.",
        emoji: "⭐"
      }
    }
  }

  if (showResult) {
    const recommendation = getRecommendedLevel()
    const percentage = Math.round((score / total) * 100)

    return (
      <div className="placementQuizPage">
        <div className="quizResultCard">
          
          {/* Result Icon */}
          <div className="resultIcon">
            {recommendation.emoji}
          </div>

          {/* Heading */}
          <h1 className="resultHeading">Quiz Complete!</h1>
          
          {/* Score */}
          <div className="resultScore">
            <span className="scoreNumber">{score}/{total}</span>
            <span className="scorePercent">{percentage}%</span>
          </div>

          {/* Stars */}
          <div className="resultStars">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={`resultStar ${i < score ? "filled" : ""}`}>
                ★
              </span>
            ))}
          </div>

          {/* Recommendation */}
          <div className="recommendationBox">
            <h2 className="recommendationTitle">Recommended Starting Point:</h2>
            <div className="recommendationLevel">
              <span className="levelBadge">📍</span>
              <span className="levelText">{recommendation.title}</span>
            </div>
            <p className="recommendationMessage">{recommendation.message}</p>
          </div>

          {/* Actions */}
          <div className="resultActions">
            <button 
              className="primaryBtn"
              onClick={() => navigate("/levels", { state: { skipQuestion: true } })}
            >
              Go to Levels
            </button>
            <button 
              className="secondaryBtn"
              onClick={() => window.location.reload()}
            >
              Retake Quiz
            </button>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="placementQuizPage">
      
      {/* Top Bar */}
      <div className="quizTopBar">
        <button className="closeBtn" onClick={() => navigate("/levels")}>✕</button>
        <div className="quizProgressBarWrap">
          <div className="quizProgressBarFill" style={{ width: `${progress}%` }} />
        </div>
        <span className="stepCount">{currentQuestion + 1}/{total}</span>
      </div>

      {/* Quiz Body */}
      <div className="quizBody">
        
        <h2 className="quizQuestion">What sign is this?</h2>

        {/* Media Display */}
        <div className="quizMediaBox">
          {question.type === "image" ? (
            <img
              src={question.media}
              alt="Sign"
              className="quizMedia"
            />
          ) : (
            <video
              src={question.media}
              className="quizMedia"
              autoPlay
              loop
              muted
              playsInline
            />
          )}
        </div>

        {/* Feedback Banner */}
        {selectedOption && (
          <div className={`quizFeedback ${selectedOption === question.letter ? "correct" : "wrong"}`}>
            {selectedOption === question.letter ? "✓ Correct!" : "✗ Wrong answer"}
          </div>
        )}

        {/* Options */}
        <div className="quizOptions">
          {question.options.map((option) => {
            let className = "quizOption"
            
            if (selectedOption) {
              if (option === question.letter) {
                className += " correct"
              } else if (option === selectedOption) {
                className += " wrong"
              } else {
                className += " dimmed"
              }
            }
            
            return (
              <button
                key={option}
                className={className}
                onClick={() => handleAnswer(option)}
                disabled={selectedOption !== null}
              >
                {option}
              </button>
            )
          })}
        </div>

        {/* Next Button */}
        {selectedOption && (
          <button className="continueBtn" onClick={handleNext}>
            {currentQuestion < total - 1 ? "Next ›" : "See Results ›"}
          </button>
        )}

      </div>
    </div>
  )
}

export default PlacementQuiz