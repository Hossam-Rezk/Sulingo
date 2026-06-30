import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/login"
import Register from "./pages/Register"
import Levels from "./pages/Levels"
import Contact from "./pages/Contact"
import About from "./pages/About"
import Quiz from "./pages/Quiz"
import PlacementQuiz from "./pages/PlacementQuiz"
import Lesson from "./pages/Lesson"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Levels */}
        <Route path="/levels" element={<Levels />} />

        {/* Contact */}
        <Route path="/contact" element={<Contact />} />

        {/* About */}
        <Route path="/about" element={<About />} />

        {/* Quiz (للـ live testing) */}
        <Route path="/quiz" element={<Quiz />} />

        {/* Placement Quiz (اختبار تحديد المستوى) */}
        <Route path="/placement-quiz" element={<PlacementQuiz />} />

        {/* Lesson */}
        <Route path="/lesson/:levelId/:lessonId" element={<Lesson />} />

      </Routes>

    </BrowserRouter>

  )

}

export default App