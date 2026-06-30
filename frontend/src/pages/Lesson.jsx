import { useState, useRef, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "../styles/lesson.css"

const LESSON_SEQUENCE = [
  "1-1", "1-2", "1-3", "1-4",
  "2-1", "2-2", "2-3", "2-4",
  "3-1", "3-2", "3-3", "3-4",
]

const lessonsData = {
  "1-1": {
    title: "Letters A - F",
    levelTitle: "Alphabets",
    steps: [
      { letter: "A", description: "Place your hand in a fist with your thumb resting on the side.", video: "/videos/a.mp4" },
      { letter: "B", description: "Hold up four fingers straight and close your thumb across your palm.", video: "/videos/b.mp4" },
      { letter: "C", description: "Curve your hand into a C shape with fingers together.", video: "/videos/c.mp4" },
      { letter: "D", description: "Touch your index finger to your thumb making a circle, other fingers up.", video: "/videos/d.mp4" },
      { letter: "E", description: "Curl all your fingers down and tuck your thumb under.", video: "/videos/e.mp4" },
      { letter: "F", description: "Touch your index finger to your thumb, other three fingers up.", video: "/videos/f.mp4" },
    ]
  },
  "1-2": {
    title: "Letters G - M",
    levelTitle: "Alphabets",
    steps: [
      { letter: "G", description: "Point your index finger sideways with thumb parallel.", video: "/videos/g.mp4" },
      { letter: "H", description: "Point your index and middle fingers sideways together.", video: "/videos/h.mp4" },
      { letter: "I", description: "Hold up your pinky finger with other fingers in a fist.", video: "/videos/i.mp4" },
      { letter: "J", description: "Hold up pinky and trace a J shape in the air.", video: "/videos/j.mp4" },
      { letter: "K", description: "Index finger up, middle finger angled, thumb between them.", video: "/videos/k.mp4" },
      { letter: "L", description: "Make an L shape with your index finger up and thumb out.", video: "/videos/l.mp4" },
      { letter: "M", description: "Tuck three fingers over your thumb.", video: "/videos/m.mp4" },
    ]
  },
  "1-3": {
    title: "Letters N - S",
    levelTitle: "Alphabets",
    steps: [
      { letter: "N", description: "Tuck two fingers over your thumb.", video: "/videos/n.mp4" },
      { letter: "O", description: "Curve all fingers to meet your thumb in an O shape.", video: "/videos/o.mp4" },
      { letter: "P", description: "Like K but point your hand downward.", video: "/videos/p.mp4" },
      { letter: "Q", description: "Like G but point your hand downward.", video: "/videos/q.mp4" },
      { letter: "R", description: "Cross your index and middle fingers.", video: "/videos/r.mp4" },
      { letter: "S", description: "Make a fist with your thumb over your fingers.", video: "/videos/s.mp4" },
    ]
  },
  "1-4": {
    title: "Letters T - Z",
    levelTitle: "Alphabets",
    steps: [
      { letter: "T", description: "Tuck your thumb between index and middle fingers.", video: "/videos/t.mp4" },
      { letter: "U", description: "Hold up index and middle fingers together pointing up.", video: "/videos/u.mp4" },
      { letter: "V", description: "Hold up index and middle fingers in a V shape.", video: "/videos/v.mp4" },
      { letter: "W", description: "Hold up index, middle and ring fingers spread apart.", video: "/videos/w.mp4" },
      { letter: "X", description: "Curl your index finger into a hook.", video: "/videos/x.mp4" },
      { letter: "Y", description: "Hold up pinky and thumb, other fingers in fist.", video: "/videos/y.mp4" },
      { letter: "Z", description: "Trace a Z shape in the air with your index finger.", video: "/videos/z.mp4" },
    ]
  },
  "2-1": {
    title: "Common Words",
    levelTitle: "Words",
    steps: [
      { letter: "Hello", description: "Touch your forehead with your flat hand, then move it outward like a salute.", video: "/videos/level 2/hello.mp4" },
      { letter: "Yes", description: "Make a fist and bend it up and down at the wrist, like nodding.", video: "/videos/level 2/yes.mp4" },
      { letter: "No", description: "Extend your index and middle fingers together and tap them against your thumb twice.", video: "/videos/level 2/no.mp4" },
      { letter: "Please", description: "Place your flat hand on your chest and move it in a circular motion.", video: "/videos/level 2/please.mp4" },
      { letter: "Want", description: "Hold both hands out with fingers spread and bent, palms up, then pull them toward your body.", video: "/videos/level 2/want.mp4" },
      { letter: "Sorry", description: "Make a fist and rub it in a circular motion over your chest.", video: "/videos/level 2/sorry.mp4" },
      { letter: "Help", description: "Place your closed fist (thumbs up) on your open flat palm, then lift both hands up together.", video: "/videos/level 2/help.mp4" },
      { letter: "Good", description: "Touch your lips with your flat hand, then move it forward and down into your other open palm.", video: "/videos/level 2/good.mp4" },
    ]
  },
  "2-2": {
    title: "Everyday Essentials",
    levelTitle: "Words",
    steps: [
      { letter: "Eat", description: "Bring your flat fingers to your mouth repeatedly, as if putting food in.", video: "/videos/level 2/eat.mp4" },
      { letter: "Drink", description: "Form a C-shape with your hand and tilt it toward your mouth, as if holding a cup.", video: "/videos/level 2/drink.mp4" },
      { letter: "Sleep", description: "Hold your open hand in front of your face, fingers spread, then lower it while closing your fingers and tilting your head.", video: "/videos/level 2/sleep.mp4" },
      { letter: "Home", description: "Touch your fingertips to your chin, then move your hand up to your cheek.", video: "/videos/level 2/home.mp4" },
      { letter: "Bathroom", description: "Make the letter T with your hand and shake it side to side at the wrist.", video: "/videos/level 2/bathroom.mp4" },
      { letter: "Morning", description: "Bend your arm at the elbow with fingers pointing up, and place your other flat hand under the elbow, then raise the bent arm upward.", video: "/videos/level 2/morning.mp4" },
      { letter: "Night", description: "Hold one arm flat and bring your bent dominant hand over it, fingers pointing down like the sun setting.", video: "/videos/level 2/night.mp4" },
      { letter: "Work", description: "Make two fists and tap the wrist of your dominant hand on top of the other fist twice.", video: "/videos/level 2/work.mp4" },
    ]
  },
  "2-3": {
    title: "Places and Movement",
    levelTitle: "Words",
    steps: [
      { letter: "School", description: "Clap both flat hands together twice, with your dominant hand on top.", video: "/videos/level 2/school.mp4" },
      { letter: "Hospital", description: "Use your dominant hand's index and middle fingers to draw a small cross (plus sign) on your upper arm.", video: "/videos/level 2/hospital.mp4" },
      { letter: "Go", description: "Point both index fingers forward, then bend them inward toward each other simultaneously.", video: "/videos/level 2/go.mp4" },
      { letter: "Walk", description: "Hold both flat hands facing down, then alternate moving them forward one at a time, mimicking walking steps.", video: "/videos/level 2/walk.mp4" },
      { letter: "Stop", description: "Bring your dominant flat hand down sharply onto your non-dominant open palm, like chopping it.", video: "/videos/level 2/stop.mp4" },
      { letter: "Where", description: "Hold up your index finger and wave it side to side with a questioning facial expression.", video: "/videos/level 2/where.mp4" },
      { letter: "Outside", description: "Form a curved hand and pull your dominant hand outward through your non-dominant curved hand, then hold it out.", video: "/videos/level 2/outside.mp4" },
    ]
  },
  "2-4": {
    title: "Daily Words",
    levelTitle: "Words",
    steps: [
      { letter: "Happy", description: "Place your open hand on your chest and move it in an upward circular motion, as if brushing joy outward from your heart.", video: "/videos/level 2/happy.mp4" },
      { letter: "Sad", description: "Hold both open hands in front of your face with fingers pointing up, then slowly lower them down your face, as if pulling sadness downward.", video: "/videos/level 2/sad.mp4" },
      { letter: "Tired", description: "Place both bent hands on your chest with fingertips touching your shoulders, then let them drop and rotate downward, as if your energy is fading.", video: "/videos/level 2/tired.mp4" },
      { letter: "Love", description: "Cross both fists over your chest, one on top of the other, pressing them gently against your heart.", video: "/videos/level 2/love.mp4" },
      { letter: "Friend", description: "Hook your index fingers together, first one on top then switch, linking them like two people connected.", video: "/videos/level 2/friend.mp4" },
      { letter: "Family", description: "Form an F shape with both hands, touch the thumbs together, then move both hands outward in a circle until the pinky fingers meet.", video: "/videos/level 2/family.mp4" },
      { letter: "Thanks", description: "Place your flat hand on your chin with fingers pointing up, then move it forward and slightly downward, as if sending gratitude outward.", video: "/videos/level 2/thanks.mp4" },
      { letter: "Father", description: "Spread your fingers wide and tap your thumb on your forehead twice.", video: "/videos/level 2/father.mp4" },
    ]
  },

  "3-1": {
    title: "Simple Sentences",
    levelTitle: "Sentences",
    steps: [
      { letter: "Hello Sorry", description: "Point to yourself with your index finger, then make a fist and rub it in a slow circle over your chest.", video: "/videos/level 3/iamsorry.mp4" },
      { letter: "I want to eat", description: "Point to yourself, then hold both hands out with fingers bent and palms up pulling them toward you (want), then bring your flat fingers to your mouth repeatedly (eat).", video: "/videos/level 3/iwanttoeat.mp4" },
      { letter: "I want to sleep", description: "Point to yourself, then hold both hands out bent pulling them toward you (want), then lower your open hand in front of your face while closing your fingers and tilting your head (sleep).", video: "/videos/level 3/iwanttosleep.mp4" },
      { letter: "I want to go to school", description: "Point to yourself, pull both bent hands toward you (want), point both index fingers forward bending them inward (go), then clap both flat hands together twice (school).", video: "/videos/level 3/iwanttogotoschool.mp4" },
      { letter: "I am going to work now", description: "Point to yourself, point both index fingers forward bending them inward (go), tap the wrist of your dominant fist on your other fist twice (work), then tap both index fingers together pointing downward (now).", video: "/videos/level 3/igotoworknow.mp4" },
    ]
  },
  "3-2": {
    title: "Conversations",
    levelTitle: "Sentences",
    steps: [
      { letter: "I eat in the morning", description: "Point to yourself, bring your flat fingers to your mouth repeatedly (eat), then raise your bent arm upward with your other flat hand under the elbow (morning).", video: "/videos/level 3/ieatinthemorning.mp4" },
      { letter: "You go home", description: "Point toward the other person (you), point both index fingers forward bending them inward (go), then touch your fingertips to your chin and move your hand up to your cheek (home).", video: "/videos/level 3/yougohome.mp4" },
      { letter: "Today I am going to the hospital", description: "Tap both index fingers together pointing downward (today/now), point to yourself, point both index fingers forward bending inward (go), then draw a cross on your upper arm with two fingers (hospital).", video: "/videos/level 3/todayigotothehospital.mp4" },
      { letter: "Today I am going outside", description: "Tap both index fingers together pointing downward (today/now), point to yourself, point both index fingers forward bending inward (go), then pull your dominant hand outward through your non-dominant curved hand (outside).", video: "/videos/level 3/todayigooutside.mp4" },
      { letter: "Stop please!", description: "Bring your dominant flat hand down sharply onto your open palm (stop), then place your flat hand on your chin and move it forward (please).", video: "/videos/level 3/stopplease.mp4" },
      { letter: "Stop now!", description: "Bring your dominant flat hand down sharply onto your open palm (stop), then tap both index fingers together pointing downward (now).", video: "/videos/level 3/stopnow.mp4" },
    ]
  },
  "3-3": {
    title: "Questions",
    levelTitle: "Sentences",
    steps: [
      { letter: "Where is the bathroom?", description: "Wave your index finger side to side with a questioning expression (where), then make the letter T with your hand and shake it side to side at the wrist (bathroom).", video: "/videos/level 3/whereisthebathroom.mp4" },
      { letter: "Where is the hospital?", description: "Wave your index finger side to side with a questioning expression (where), then draw a cross on your upper arm with two fingers (hospital).", video: "/videos/level 3/whereisthehospital.mp4" },
      { letter: "Where are you?", description: "Wave your index finger side to side with a questioning expression (where), then point toward the other person (you).", video: "/videos/level 3/whereareyou.mp4" },
      { letter: "Can I help you?", description: "Place your closed fist thumb-up on your open palm and lift both hands upward (help), then point to yourself (I), then point toward the other person (you).", video: "/videos/level 3/canihelpyou.mp4" },
    ]
  },
}

// Helper: convert sentence to filename-safe string
function toQuizFilename(letter) {
  return letter
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getQuizOptions(steps, correctIndex) {
  const correct = steps[correctIndex]
  const others = steps.filter((_, i) => i !== correctIndex)
  const shuffledOthers = shuffleArray(others).slice(0, 3)
  return shuffleArray([correct, ...shuffledOthers])
}

function getNextLessonKey(currentKey) {
  const idx = LESSON_SEQUENCE.indexOf(currentKey)
  if (idx === -1 || idx === LESSON_SEQUENCE.length - 1) return null
  return LESSON_SEQUENCE[idx + 1]
}

const LEVEL2_LESSONS_WS = {
  1: "ws://localhost:8001/ws/predict-words",
  2: "ws://localhost:8001/ws/predict-words",
  3: "ws://localhost:8001/ws/predict-words",
  4: "ws://localhost:8001/ws/predict-words",
}

const LEVEL1_API_URL = "http://localhost:8000" // Assuming Level 1 backend is on port 8000

// ── Level 3 sentence practice ──────────────────────────────────────────────
const LEVEL3_WS_URL = "ws://localhost:8001/ws/sentence-practice"

/**
 * Maps each Level 3 sentence (as it appears in lessonsData) to the ordered list
 * of ASL gloss tokens the model is expected to predict.
 * Only words the RF model knows are included; grammar fillers (to/the/is/am/a/are/in/can)
 * are stripped because the model was not trained on them.
 */
const LEVEL3_GLOSS_MAP = {
  "hello sorry":                       ["hello", "sorry"],
  "I want to eat":                    ["i", "want", "eat"],
  "I want to sleep":                  ["i", "want", "sleep"],
  "I want to go to school":           ["i", "want", "go", "school"],
  "I am going to work now":           ["i", "go", "work", "now"],
  "I eat in the morning":             ["i", "eat", "morning"],
  "You go home":                      ["you", "go", "home"],
  "Today I am going to the hospital": ["today", "i", "go", "hospital"],
  "Today I am going outside":         ["today", "i", "go", "outside"],
  "Stop please!":                     ["stop", "please"],
  "Stop now!":                        ["stop", "now"],
  "Where is the bathroom?":           ["where", "bathroom"],
  "Where is the hospital?":           ["where", "hospital"],
  "Where are you?":                   ["where", "you"],
  "Can I help you?":                  ["i", "help", "you"],
}

function Lesson() {
  const { levelId, lessonId } = useParams()
  const navigate = useNavigate()
  const key = `${levelId}-${lessonId}`
  const lesson = lessonsData[key]

  const [mode, setMode] = useState("learn")
  const [currentStep, setCurrentStep] = useState(0)

  const [quizStep, setQuizStep] = useState(0)
  const [quizOrder, setQuizOrder] = useState([])
  const [quizOptions, setQuizOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [quizFeedback, setQuizFeedback] = useState("")
  const [quizCorrect, setQuizCorrect] = useState(0)

  const [aiStep, setAiStep] = useState(0)
  const [aiFeedback, setAiFeedback] = useState("")
  const [predictedLetter, setPredictedLetter] = useState("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [wrongStreak, setWrongStreak] = useState(0)
  const [aiCorrect, setAiCorrect] = useState(0)

  // Level 3 sentence-practice state
  const [l3GlossTokens, setL3GlossTokens]   = useState([])   // ordered token list for current step
  const [l3TokenIndex, setL3TokenIndex]     = useState(0)    // which token we're currently testing
  const [l3Feedback, setL3Feedback]         = useState("")   // "" | "correct" | "wrong"
  const [l3WrongWord, setL3WrongWord]       = useState("")   // word shown in retry banner

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const detectionIntervalRef = useRef(null)
  const wsRef = useRef(null)
  const advancingRef = useRef(false)
  const aiStepRef = useRef(aiStep)
  const wrongStreakRef = useRef(0)

  // Level 3 refs (needed inside async WS callbacks)
  const l3TokenIndexRef  = useRef(0)
  const l3GlossTokensRef = useRef([])

  useEffect(() => { aiStepRef.current = aiStep }, [aiStep])
  useEffect(() => { wrongStreakRef.current = wrongStreak }, [wrongStreak])
  useEffect(() => { l3TokenIndexRef.current  = l3TokenIndex  }, [l3TokenIndex])
  useEffect(() => { l3GlossTokensRef.current = l3GlossTokens }, [l3GlossTokens])

  const isLevel2 = Number(levelId) === 2
  const isLevel3 = Number(levelId) === 3

  const getLevel2WsUrl = () => {
    const base = LEVEL2_LESSONS_WS[Number(lessonId)] ?? LEVEL2_LESSONS_WS[1]
    return `${base}?ngrok-skip-browser-warning=69420`
  }

  useEffect(() => {
    setMode("learn")
    setCurrentStep(0)
    setQuizStep(0)
    setQuizOrder([])
    setQuizOptions([])
    setSelectedOption(null)
    setQuizFeedback("")
    setQuizCorrect(0)
    setAiStep(0)
    setAiFeedback("")
    setPredictedLetter("")
    setWrongStreak(0)
    wrongStreakRef.current = 0
    setAiCorrect(0)
    advancingRef.current = false
    // Reset Level 3
    setL3GlossTokens([])
    setL3TokenIndex(0)
    setL3Feedback("")
    setL3WrongWord("")
    l3GlossTokensRef.current = []
    l3TokenIndexRef.current  = 0
    stopDetection()
    stopCamera()
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode === "quiz" && lesson && quizOrder.length === 0) {
      const indices = lesson.steps.map((_, i) => i)
      setQuizOrder(shuffleArray(indices))
    }
  }, [mode, lesson, quizOrder.length])

  useEffect(() => {
    if (mode === "quiz" && lesson && quizOrder.length > 0) {
      setQuizOptions(getQuizOptions(lesson.steps, quizOrder[quizStep]))
      setSelectedOption(null)
      setQuizFeedback("")
    }
  }, [mode, quizStep, lesson, quizOrder])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => resolve()
        })
      }
      streamRef.current = stream
    } catch (err) {
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const startWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    const ws = new WebSocket(getLevel2WsUrl())
    ws.binaryType = "arraybuffer"
    wsRef.current = ws

    ws.onopen = () => {
      console.log("WebSocket connected")
      detectionIntervalRef.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return
        const canvas = canvasRef.current
        const video = videoRef.current
        if (!canvas || !video || video.videoWidth === 0) return

        const ctx = canvas.getContext("2d")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        canvas.toBlob((blob) => {
          if (!blob || ws.readyState !== WebSocket.OPEN) return
          blob.arrayBuffer().then(buf => ws.send(buf))
        }, "image/jpeg", 0.7)
      }, 100)
    }

    ws.onmessage = (event) => {
      if (advancingRef.current) return
      const data = JSON.parse(event.data)

      if (data.status === "prediction" && data.prediction) {
        const prediction = data.prediction.trim()
        setPredictedLetter(prediction)

        const required = lesson.steps[aiStepRef.current].letter
        const isCorrect = prediction.toLowerCase() === required.toLowerCase()

        if (isCorrect) {
          advancingRef.current = true
          setAiFeedback("correct")
          setAiCorrect(s => s + 1)
          setWrongStreak(0)
          wrongStreakRef.current = 0
          stopDetection()

          setTimeout(() => {
            const next = aiStepRef.current + 1
            if (next < lesson.steps.length) {
              setAiStep(next)
              setAiFeedback("")
              setPredictedLetter("")
              advancingRef.current = false
            } else {
              stopCamera()
              setMode("result")
            }
          }, 1500)
        } else {
          const newStreak = wrongStreakRef.current + 1
          setWrongStreak(newStreak)
          wrongStreakRef.current = newStreak

          if (newStreak >= 5) {
            advancingRef.current = true
            setAiFeedback("skipped")
            stopDetection()

            setTimeout(() => {
              const next = aiStepRef.current + 1
              setWrongStreak(0)
              wrongStreakRef.current = 0
              if (next < lesson.steps.length) {
                setAiStep(next)
                setAiFeedback("")
                setPredictedLetter("")
                advancingRef.current = false
              } else {
                stopCamera()
                setMode("result")
              }
            }, 1800)
          } else {
            setAiFeedback("wrong")
          }
        }
      }
    }

    ws.onerror = (err) => console.error("WebSocket error:", err)
    ws.onclose = () => console.log("WebSocket closed")
  }, [lesson, stopDetection]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Level 3 WebSocket — sentence practice mode ───────────────────────────
  const startLevel3WebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    const ws = new WebSocket(LEVEL3_WS_URL)
    ws.binaryType = "arraybuffer"
    wsRef.current = ws

    ws.onopen = () => {
      console.log("[L3] WebSocket connected")
      // Tell the server which word to expect first
      const tokens = l3GlossTokensRef.current
      const idx    = l3TokenIndexRef.current
      if (tokens.length > 0 && idx < tokens.length) {
        ws.send(`EXPECT:${tokens[idx]}`)
      }
      // Stream frames every 100 ms
      detectionIntervalRef.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return
        const canvas = canvasRef.current
        const video  = videoRef.current
        if (!canvas || !video || video.videoWidth === 0) return
        const ctx = canvas.getContext("2d")
        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
          if (!blob || ws.readyState !== WebSocket.OPEN) return
          blob.arrayBuffer().then(buf => ws.send(buf))
        }, "image/jpeg", 0.7)
      }, 100)
    }

    ws.onmessage = (event) => {
      if (advancingRef.current) return
      const data = JSON.parse(event.data)

      if (data.prediction) {
        console.log(`[L3 Camera] Guessed: ${data.prediction} (${(data.confidence * 100).toFixed(1)}%) | Looking for: ${l3GlossTokensRef.current[l3TokenIndexRef.current]}`)
      }

      if (data.status === "correct") {
        // Flash correct, then advance to next token (or next lesson step)
        advancingRef.current = true
        setL3Feedback("correct")

        setTimeout(() => {
          const tokens  = l3GlossTokensRef.current
          const nextIdx = l3TokenIndexRef.current + 1

          if (nextIdx < tokens.length) {
            // Still more words in this sentence
            setL3TokenIndex(nextIdx)
            setL3Feedback("")
            advancingRef.current = false
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(`EXPECT:${tokens[nextIdx]}`)
            }
          } else {
            // All words in this sentence signed correctly → advance lesson step
            setL3Feedback("")
            setAiCorrect(s => s + 1)
            advancingRef.current = false
            stopDetection()
            const nextStep = aiStepRef.current + 1
            if (nextStep < lesson.steps.length) {
              setAiStep(nextStep)
            } else {
              stopCamera()
              setMode("result")
            }
          }
        }, 1200)

      } else if (data.status === "wrong") {
        // Show retry banner — do NOT advance, user must sign the word again
        setL3Feedback("wrong")
        setL3WrongWord(data.expected || "")
      }
      // "collecting" status: intentionally ignored — no UI update
    }

    ws.onerror = (err) => console.error("[L3] WebSocket error:", err)
    ws.onclose = () => console.log("[L3] WebSocket closed")
  }, [lesson, stopDetection]) // eslint-disable-line react-hooks/exhaustive-deps

  const runDetection = useCallback(async () => {
    if (isDetecting || advancingRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || video.videoWidth === 0) return

    setIsDetecting(true)
    try {
      const ctx = canvas.getContext("2d")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"))
      const formData = new FormData()
      formData.append("file", blob, "gesture.jpg")

      const res = await fetch(`${LEVEL1_API_URL}/predict-image`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "69420" },
        body: formData,
      })
      const data = await res.json()
      const prediction = (data.prediction ?? "").trim()
      setPredictedLetter(prediction)

      const required = lesson.steps[aiStepRef.current].letter
      const isCorrect = prediction.toLowerCase() === required.toLowerCase()

      if (isCorrect && !advancingRef.current) {
        advancingRef.current = true
        setAiFeedback("correct")
        setAiCorrect(s => s + 1)
        setWrongStreak(0)
        wrongStreakRef.current = 0
        stopDetection()

        setTimeout(() => {
          const next = aiStepRef.current + 1
          if (next < lesson.steps.length) {
            setAiStep(next)
            setAiFeedback("")
            setPredictedLetter("")
            advancingRef.current = false
          } else {
            stopCamera()
            setMode("result")
          }
        }, 1500)
      } else {
        const newStreak = wrongStreakRef.current + 1
        setWrongStreak(newStreak)
        wrongStreakRef.current = newStreak

        if (newStreak >= 5 && !advancingRef.current) {
          advancingRef.current = true
          setAiFeedback("skipped")
          stopDetection()

          setTimeout(() => {
            const next = aiStepRef.current + 1
            setWrongStreak(0)
            wrongStreakRef.current = 0
            if (next < lesson.steps.length) {
              setAiStep(next)
              setAiFeedback("")
              setPredictedLetter("")
              advancingRef.current = false
            } else {
              stopCamera()
              setMode("result")
            }
          }, 1800)
        } else {
          setAiFeedback("wrong")
        }
      }
    } catch (err) {
      console.error("Detection error:", err)
      setAiFeedback("error")
    } finally {
      setIsDetecting(false)
    }
  }, [isDetecting, lesson, stopDetection])

  useEffect(() => {
    if (mode === "ai") {
      // Initialise Level 3 gloss tokens for the current step
      if (isLevel3 && lesson) {
        const sentence = lesson.steps[aiStep]?.letter || ""
        const tokens   = LEVEL3_GLOSS_MAP[sentence] || []
        setL3GlossTokens(tokens)
        l3GlossTokensRef.current = tokens
        setL3TokenIndex(0)
        l3TokenIndexRef.current = 0
        setL3Feedback("")
        setL3WrongWord("")
      }
      startCamera().then(() => {
        if (isLevel2) {
          startWebSocket()
        } else if (isLevel3) {
          startLevel3WebSocket()
        } else {
          detectionIntervalRef.current = setInterval(runDetection, 2000)
        }
      })
    } else {
      stopDetection()
      stopCamera()
    }
    return () => {
      stopDetection()
      stopCamera()
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode === "ai") {
      stopDetection()
      advancingRef.current = false
      setWrongStreak(0)
      wrongStreakRef.current = 0

      // Reset Level 3 gloss state for the new lesson step
      if (isLevel3 && lesson) {
        const sentence = lesson.steps[aiStepRef.current]?.letter || ""
        const tokens   = LEVEL3_GLOSS_MAP[sentence] || []
        setL3GlossTokens(tokens)
        l3GlossTokensRef.current = tokens
        setL3TokenIndex(0)
        l3TokenIndexRef.current = 0
        setL3Feedback("")
        setL3WrongWord("")
      }

      setTimeout(() => {
        if (isLevel2) {
          startWebSocket()
        } else if (isLevel3) {
          startLevel3WebSocket()
        } else {
          detectionIntervalRef.current = setInterval(runDetection, 2000)
        }
      }, 500)
    }
  }, [aiStep]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    setMode("learn")
    setCurrentStep(0)
    setQuizStep(0)
    setQuizOrder([])
    setQuizOptions([])
    setSelectedOption(null)
    setQuizFeedback("")
    setQuizCorrect(0)
    setAiStep(0)
    setAiFeedback("")
    setPredictedLetter("")
    setWrongStreak(0)
    wrongStreakRef.current = 0
    setAiCorrect(0)
    advancingRef.current = false
    // Reset Level 3
    setL3GlossTokens([])
    setL3TokenIndex(0)
    setL3Feedback("")
    setL3WrongWord("")
    l3GlossTokensRef.current = []
    l3TokenIndexRef.current  = 0
  }

  const handleRetakeExam = () => {
    setQuizStep(0)
    setQuizOrder([])
    setQuizOptions([])
    setSelectedOption(null)
    setQuizFeedback("")
    setQuizCorrect(0)
    setAiStep(0)
    setAiFeedback("")
    setPredictedLetter("")
    setWrongStreak(0)
    wrongStreakRef.current = 0
    setAiCorrect(0)
    advancingRef.current = false
    // Reset Level 3
    setL3GlossTokens([])
    setL3TokenIndex(0)
    setL3Feedback("")
    setL3WrongWord("")
    l3GlossTokensRef.current = []
    l3TokenIndexRef.current  = 0
    setMode("quiz")
  }

  if (!lesson) {
    return (
      <div className="lessonNotFound">
        <h1>Lesson not found</h1>
        <button onClick={() => navigate("/levels", { state: { skipQuestion: true } })}>Back to Levels</button>
      </div>
    )
  }

  const total = lesson.steps.length
  const nextKey = getNextLessonKey(key)
  const totalQuestions = total * 2
  const totalCorrect = quizCorrect + aiCorrect
  const pct = Math.round((totalCorrect / totalQuestions) * 100)
  const isPerfect = pct === 100
  const isGood    = pct >= 60 && pct < 80
  const isPassed  = pct >= 80
  const isFailed  = pct < 60

  const learnStep = lesson.steps[currentStep]
  const learnProgress = (currentStep / total) * 100

  const handleLearnContinue = () => {
    if (currentStep < total - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setQuizStep(0)
      setQuizCorrect(0)
      setQuizOrder([])
      setMode("quiz")
    }
  }

  const quizCurrentStep = quizOrder.length > 0 ? lesson.steps[quizOrder[quizStep]] : lesson.steps[0]
  const quizProgress = (quizStep / total) * 100

  const handleQuizAnswer = (option) => {
    if (selectedOption) return
    setSelectedOption(option)
    if (option.letter === quizCurrentStep.letter) {
      setQuizFeedback("correct")
      setQuizCorrect(s => s + 1)
    } else {
      setQuizFeedback("wrong")
    }
  }

  const handleQuizNext = () => {
    if (quizStep < total - 1) {
      setQuizStep(quizStep + 1)
    } else {
      setMode("ready")
    }
  }

  const handleReadyYes = () => {
    setAiStep(0)
    setAiFeedback("")
    setPredictedLetter("")
    setAiCorrect(0)
    setWrongStreak(0)
    wrongStreakRef.current = 0
    advancingRef.current = false
    setMode("ai")
  }

  const handleReadyNo = () => { handleRetry() }

  const aiCurrentStep = lesson.steps[aiStep]
  const aiProgress = (aiStep / total) * 100

  return (
    <div className="lessonPage">

      {/* ════════════ LEARN MODE ════════════ */}
      {mode === "learn" && (
        <>
          <div className="lessonTopBar">
            <button className="closeBtn" onClick={() => navigate("/levels", { state: { skipQuestion: true } })}>✕</button>
            <div className="lessonProgressBarWrap">
              <div className="lessonProgressBarFill" style={{ width: `${learnProgress}%` }} />
            </div>
            <span className="stepCount">{currentStep + 1}/{total}</span>
          </div>
          <div className="lessonBody">
            <h1 className="stepTitle">{learnStep.letter}</h1>
            <div className="stepVideoBox">
              {learnStep.video ? (
                <video src={learnStep.video} controls autoPlay loop />
              ) : (
                <div className="stepVideoPlaceholder">
                  <span>🎬</span>
                  <p>Video for "{learnStep.letter}"</p>
                </div>
              )}
            </div>
            <p className="stepDescription">{learnStep.description}</p>
            <button className="continueBtn" onClick={handleLearnContinue}>Continue ›</button>
          </div>
        </>
      )}

      {/* ════════════ QUIZ MODE ════════════ */}
      {mode === "quiz" && (
        <>
          <div className="lessonTopBar">
            <button className="closeBtn" onClick={() => navigate("/levels", { state: { skipQuestion: true } })}>✕</button>
            <div className="lessonProgressBarWrap">
              <div className="lessonProgressBarFill" style={{ width: `${quizProgress}%` }} />
            </div>
            <span className="stepCount">{quizStep + 1}/{total}</span>
          </div>
          <div className="lessonBody">
            <h2 className="quizQuestion">
              {isLevel3 ? "What sentence is this sign?" : "What letter is this sign?"}
            </h2>
            <div className="quizGestureBox">
              {(isLevel2 || isLevel3) ? (
                <video
                  key={quizCurrentStep.letter}
                  src={`/quiz/${toQuizFilename(quizCurrentStep.letter)}.mp4`}
                  className="quizGestureImage"
                  autoPlay loop muted playsInline
                />
              ) : (
                <img
                  src={`/quiz/${quizCurrentStep.letter.toLowerCase()}.png`}
                  alt={quizCurrentStep.letter}
                  className="quizGestureImage"
                />
              )}
            </div>
            {quizFeedback && (
              <div className={`quizFeedbackBanner ${quizFeedback}`}>
                {quizFeedback === "correct" ? "✓ Correct! Well done!" : "✗ Wrong answer. Try again next time!"}
              </div>
            )}
            <div className="quizOptions">
              {quizOptions.map((option) => {
                let className = "quizOption"
                if (selectedOption) {
                  if (option.letter === quizCurrentStep.letter) className += " correct"
                  else if (option.letter === selectedOption.letter) className += " wrong"
                  else className += " dimmed"
                }
                return (
                  <button
                    key={option.letter}
                    className={className}
                    onClick={() => handleQuizAnswer(option)}
                    disabled={selectedOption !== null}
                  >
                    {option.letter}
                  </button>
                )
              })}
            </div>
            {selectedOption && (
              <button className="continueBtn quizNextBtn" onClick={handleQuizNext}>
                {quizStep < total - 1 ? "Next ›" : "Continue ›"}
              </button>
            )}
          </div>
        </>
      )}

      {/* ════════════ READY SCREEN ════════════ */}
      {mode === "ready" && (
        <div className="readyPage">
          <div className="readyCard">
            <div className="readyIconWrap">
              <div className="readyIconRing" />
              <div className="readyIconCircle">
                <span className="readyIconEmoji">📷</span>
              </div>
            </div>
            <h1 className="readyHeading">Camera Test Time!</h1>
            <p className="readySubtext">
              Great job on the quiz! Now it's time to practice with your camera.
              The AI will watch your hand signs in real time.
            </p>
            <div className="readyTips">
              <div className="readyTip"><span className="readyTipIcon">💡</span><span>Make sure you're in a well-lit area</span></div>
              <div className="readyTip"><span className="readyTipIcon">🖐️</span><span>Keep your hand clearly visible to the camera</span></div>
              <div className="readyTip"><span className="readyTipIcon">🔇</span><span>Find a plain background if possible</span></div>
            </div>
            <p className="readyQuestion">Are you ready for the camera test?</p>
            <div className="readyActions">
              <button className="readyBtnYes" onClick={handleReadyYes}>
                <span>Yes, I'm Ready!</span>
                <span className="readyBtnArrow">→</span>
              </button>
              <button className="readyBtnNo" onClick={handleReadyNo}>↩ Go Back &amp; Review Lesson</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ AI MODE — Level 1 & 2 ════════════ */}
      {mode === "ai" && !isLevel3 && (
        <>
          <div className="lessonTopBar">
            <button className="closeBtn" onClick={() => navigate("/levels", { state: { skipQuestion: true } })}>✕</button>
            <div className="lessonProgressBarWrap">
              <div className="lessonProgressBarFill" style={{ width: `${aiProgress}%` }} />
            </div>
            <span className="stepCount">{aiStep + 1}/{total}</span>
          </div>
          <div className="lessonBody">
            <div className="aiPrompt">
              <span className="aiPromptLabel">Do the sign:</span>
              <span className="aiPromptLetter">{aiCurrentStep.letter}</span>
            </div>
            <div className="aiCameraBox">
              <video ref={videoRef} autoPlay playsInline className="aiCamera" />
              {aiFeedback === "correct" && (
                <div className="aiOverlay correct"><span>✓</span><p>Correct!</p></div>
              )}
              {aiFeedback === "skipped" && (
                <div className="aiOverlay skipped"><span>⏭</span><p>Skipped!</p></div>
              )}
            </div>
            <div className="aiPredictionBox">
              <span className="aiPredictionLabel">Predicted sign:</span>
              <span className={`aiPredictionValue ${
                aiFeedback === "correct" ? "predCorrect" :
                aiFeedback === "wrong"   ? "predWrong"   :
                aiFeedback === "skipped" ? "predSkipped" : ""
              }`}>
                {predictedLetter || "—"}
              </span>
            </div>
            {aiFeedback === "wrong" && wrongStreak > 0 && (
              <div className="aiStreakWarning">
                <span className="aiStreakDots">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`aiStreakDot ${i < wrongStreak ? "filled" : ""}`} />
                  ))}
                </span>
                <span className="aiStreakText">
                  {5 - wrongStreak} more wrong {5 - wrongStreak === 1 ? "attempt" : "attempts"} before skipping
                </span>
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        </>
      )}

      {/* ════════════ AI MODE — Level 3 Sentence Practice ════════════ */}
      {mode === "ai" && isLevel3 && (
        <>
          <div className="lessonTopBar">
            <button className="closeBtn" onClick={() => navigate("/levels", { state: { skipQuestion: true } })}>✕</button>
            <div className="lessonProgressBarWrap">
              <div className="lessonProgressBarFill" style={{ width: `${aiProgress}%` }} />
            </div>
            <span className="stepCount">{aiStep + 1}/{total}</span>
          </div>
          <div className="lessonBody">

            {/* ── Sentence display: each word highlighted by role ── */}
            <div className="l3SentenceHeader">
              <span className="l3SentenceLabel">Sign this sentence:</span>
              <div className="l3SentenceRow" style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '10px 0' }}>
                {aiCurrentStep.letter}
              </div>
            </div>

            {/* ── Camera feed ── */}
            <div className="aiCameraBox">
              <video ref={videoRef} autoPlay playsInline className="aiCamera" />
              {l3Feedback === "correct" && (
                <div className="aiOverlay correct">
                  <span>✓</span>
                  <p>Correct!</p>
                </div>
              )}
            </div>

            {/* ── Feedback banner (only visible on wrong) ── */}
            {l3Feedback === "wrong" && l3WrongWord && (
              <div className="l3RetryBanner">
                ❌ Please repeat the word:{" "}
                <strong className="l3RetryWord">{l3WrongWord.toUpperCase()}</strong>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        </>
      )}

      {/* ════════════ RESULT SCREEN ════════════ */}
      {mode === "result" && (
        <div className="resultPage">
          <div className="resultCard">
            <div className={`resultIconCircle ${isFailed ? "fail" : isGood ? "mid" : "pass"}`}>
              {isPerfect ? "😄" : isPassed ? "🏆" : isGood ? "😐" : "😢"}
            </div>
            <h1 className="resultHeading">
              {isPerfect ? "Perfect Score!" : isPassed ? "Lesson Passed!" : isGood ? "Almost There!" : "Keep Practicing!"}
            </h1>
            <p className="resultSubtext">
              {isPerfect ? "Amazing — you got everything right!"
                : isPassed ? "Great work — you're ready for the next lesson."
                : isGood ? "You passed, but there's room to improve. Retake the exam or move on."
                : "You need 60% or more to pass. Review the lesson and try again."}
            </p>
            <div className={`resultScorePill ${isFailed ? "fail" : isGood ? "mid" : "pass"}`}>
              <span className="resultScoreNumber">{pct}%</span>
              <span className="resultScoreLabel">{totalCorrect}/{totalQuestions} correct</span>
            </div>
            <div className="resultBreakdown">
              <div className="resultBreakdownItem">
                <span className="resultBreakdownLabel">📝 Quiz</span>
                <span className="resultBreakdownVal">{quizCorrect}/{total}</span>
              </div>
              <div className="resultBreakdownDivider" />
              <div className="resultBreakdownItem">
                <span className="resultBreakdownLabel">📷 Camera</span>
                <span className="resultBreakdownVal">{aiCorrect}/{total}</span>
              </div>
            </div>
            <div className="resultStars">
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <span key={i} className={`resultStar ${i < totalCorrect ? "filled" : ""}`}>★</span>
              ))}
            </div>
            <div className="resultActions">
              {isFailed && (
                <>
                  <button className="resultBtnPrimary" onClick={handleRetry}>↩ Retake the Lesson</button>
                  <button className="resultBtnSecondary" onClick={() => navigate("/levels", { state: { skipQuestion: true } })}>Back to Levels</button>
                </>
              )}
              {isGood && (
                <>
                  <button className="resultBtnPrimary" onClick={handleRetakeExam}>🔁 Retake the Exam</button>
                  {nextKey ? (
                    <button className="resultBtnSecondary" onClick={() => {
                      const [lvl, les] = nextKey.split("-")
                      navigate(`/lesson/${lvl}/${les}`)
                    }}>Next Lesson ›</button>
                  ) : (
                    <button className="resultBtnSecondary" onClick={() => navigate("/levels", { state: { skipQuestion: true } })}>Back to Levels</button>
                  )}
                </>
              )}
              {isPassed && (
                <>
                  {nextKey ? (
                    <button className="resultBtnPrimary" onClick={() => {
                      const [lvl, les] = nextKey.split("-")
                      navigate(`/lesson/${lvl}/${les}`)
                    }}>Next Lesson ›</button>
                  ) : (
                    <button className="resultBtnPrimary" onClick={() => navigate("/levels", { state: { skipQuestion: true } })}>All Done! Back to Levels 🎉</button>
                  )}
                  <button className="resultBtnSecondary" onClick={() => navigate("/levels", { state: { skipQuestion: true } })}>Back to Levels</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Lesson