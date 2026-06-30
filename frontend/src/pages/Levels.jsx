import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import logo from "../assets/logo.png"
import "../styles/levels.css"

const levelsData = [
  {
    id: 1,
    title: "Alphabets",
    emoji: "🔤",
    color: "levelBlue",
    lessons: [
      { id: 1, title: "Letters A - F", done: true },
      { id: 2, title: "Letters G - M", done: true},
      { id: 3, title: "Letters N - S", done: false },
      { id: 4, title: "Letters T - Z", done: false },  
    ]
  },
  {
    id: 2,
    title: "Words",
    emoji: "💬",
    color: "levelOrange",
    lessons: [
      { id: 1, title: "Common Words", done: false },
      { id: 2, title: "Everyday Essentials", done: false },
      { id: 3, title: "Places and Movement", done: false },
      { id: 4, title: "Daily Words", done: true },
    ]
  },
  {
    id: 3,
    title: "Sentences",
    emoji: "📝",
    color: "levelPink",
    lessons: [
      { id: 1, title: "Simple Sentences", done: false },
      { id: 2, title: "Conversations", done: false },
      { id: 3, title: "Questions", done: false },
    ]
  }
]

function Levels() {

  const navigate = useNavigate()
  const location = useLocation()

  // If we came back from a lesson (skipQuestion flag), go straight to levels list
  const initialStage = location.state?.skipQuestion ? "levels" : "question"

  const [stage, setStage] = useState(initialStage)
  const [openLevel, setOpenLevel] = useState(null)

  // NEW: track the level unlocked by the placement quiz (read from localStorage).
  // null means "no quiz taken yet" -> only Level 1 should be unlocked by default.
  const [placementLevel, setPlacementLevel] = useState(null)

  // NEW: read the saved placement quiz result whenever this page mounts.
  // This runs again every time the user navigates back here (e.g. after a retake),
  // so a fresh quiz result is always picked up.
  useEffect(() => {
    const saved = localStorage.getItem("placementLevel")
    if (saved) {
      setPlacementLevel(Number(saved))
    }
  }, [location.key])

  const totalLessons = levelsData.flatMap(l => l.lessons).length
  const doneLessons = levelsData.flatMap(l => l.lessons).filter(l => l.done).length
  const progressPercent = Math.round((doneLessons / totalLessons) * 100)
  const xp = doneLessons * 25
  const streak = 3

  const handleChoice = (choice) => {
    if (choice === "test") {
      navigate("/quiz")
    } else {
      setStage("levels")
    }
  }

  const toggleLevel = (id) => {
    setOpenLevel(openLevel === id ? null : id)
  }

  if (stage === "question") {
    return (
      <div className="questionPage">
        <div className="questionCard">

          <Link to="/">
            <img src={logo} alt="Sulingo" className="questionLogo" />
          </Link>

          <h1>Where would you like to begin your sign language journey?</h1>
          <p>We'll personalize your learning path based on your experience.</p>

          <div className="questionButtons">

            <button
              className="choiceBtn testBtn"
              onClick={() => handleChoice("test")}
            >
              <span className="choiceIcon">🏆</span>
              <span className="choiceTitle">Take Placement Quiz</span>
              <span className="choiceSub">I know some signs already</span>
            </button>

            <button
              className="choiceBtn beginnerBtn"
              onClick={() => handleChoice("beginner")}
            >
              <span className="choiceIcon">⭐</span>
              <span className="choiceTitle">Start from Level 1</span>
              <span className="choiceSub">I'm a complete beginner</span>
            </button>

          </div>

        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />

      <div className="levelsPage">
        <div className="levelsContainer">

          <h1 className="levelsTitle">Your Learning Path</h1>
          <p className="levelsSubtitle">Complete each level to unlock the next one</p>

          {/* STATS BAR */}
          <div className="statsBar">

            <div className="statItem">
              <span className="statEmoji">📊</span>
              <div>
                <p className="statValue">{progressPercent}%</p>
                <p className="statLabel">Progress</p>
              </div>
            </div>

            <div className="statDivider" />

            <div className="statItem">
              <span className="statEmoji">⭐</span>
              <div>
                <p className="statValue">{xp} XP</p>
                <p className="statLabel">Experience</p>
              </div>
            </div>

            <div className="statDivider" />

            {/* <div className="statItem">
              <span className="statEmoji">🔥</span>
              <div>
                <p className="statValue">{streak} Days</p>
                <p className="statLabel">Streak</p>
              </div>
            </div> */}

          </div>

          <div className="levelsList">

            {levelsData.map((level, index) => {

              const isOpen = openLevel === level.id
              const completedCount = level.lessons.filter(l => l.done).length
              const progress = Math.round((completedCount / level.lessons.length) * 100)

              // ORIGINAL unlock rule: a level unlocks once the previous
              // level has at least one completed lesson.
              const unlockedByProgress =
                index === 0 || levelsData[index - 1].lessons.some(l => l.done)

              // NEW: a level also unlocks if the placement quiz recommended
              // this level or higher (e.g. placementLevel = 3 unlocks 1, 2, and 3).
              const unlockedByPlacement =
                placementLevel !== null && level.id <= placementLevel

              // A level is locked only if NEITHER condition unlocks it.
              const isLocked = !unlockedByProgress && !unlockedByPlacement

              return (
                <div key={level.id} className={`levelCard ${level.color} ${isLocked ? "locked" : ""}`}>

                  <div
                    className="levelHeader"
                    onClick={() => !isLocked && toggleLevel(level.id)}
                  >

                    <div className="levelLeft">
                      <span className="levelEmoji">{isLocked ? "🔒" : level.emoji}</span>
                      <div>
                        <h2 className="levelTitle">Level {level.id}: {level.title}</h2>
                        <p className="levelProgress">{completedCount}/{level.lessons.length} lessons completed</p>
                      </div>
                    </div>

                    <div className="levelRight">
                      <div className="progressBar">
                        <div
                          className="progressFill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="levelArrow">{isOpen ? "▲" : "▼"}</span>
                    </div>

                  </div>

                  {isOpen && (
                    <div className="lessonsList">
                      {level.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`lessonItem ${lesson.done ? "lessonDone" : ""}`}
                        >
                          <span className="lessonIcon">{lesson.done ? "✅" : "⭕"}</span>
                          <span className="lessonTitle">{lesson.title}</span>
                          {!lesson.done && (
                            <button
                              className="startLesson"
                              onClick={() => navigate(`/lesson/${level.id}/${lesson.id}`)}
                            >
                              Start
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )
            })}

          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

export default Levels