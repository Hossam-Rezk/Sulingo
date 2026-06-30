import Navbar from "../components/Navbar"
import hero from "../assets/hero.png"
import { useNavigate } from "react-router-dom"

import "../styles/home.css"

import Why from "../components/Why"
import Stats from "../components/Stats"
import Footer from "../components/Footer"

function Home() {

  const navigate = useNavigate()

  const handleGetStarted = () => {
    const user = localStorage.getItem("user")
    if (user) {
      navigate("/levels")
    } else {
      navigate("/login")
    }
  }

  return (
    <>

      <Navbar />

      {/* HERO SECTION */}
      <section className="hero">

        <div className="heroText">

          <h1>Welcome to Sulingo</h1>

          <h2>—Where Hands Speak—</h2>

          <p>
            Start your journey into the world of sign language with Sulingo.
            Whether you're a beginner or want to sharpen your skills,
            our interactive lessons make learning sign language easy,
            fun and engaging.
          </p>

          <button
            className="startBtn"
            onClick={handleGetStarted}
          >
            Get Started
          </button>

        </div>

        <div className="heroImage">
          <img src={hero} alt="sign language" />
        </div>

        {/* WAVE */}
        <div className="wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#f6f7fb"
              d="M0,60 Q360,120 720,60 Q1080,0 1440,80 L1440,120 L0,120 Z"
            />
          </svg>
        </div>

      </section>

      {/* WHY SULINGO */}
      <Why />

      {/* WHITE GAP BEFORE STATS */}
      <div style={{ background: '#f6f7fb', height: '80px' }} />

      {/* STATISTICS */}
      <Stats />

      {/* WHITE GAP BETWEEN STATS AND FOOTER */}
      <div style={{ background: '#ffffff', height: '120px' }} />

      {/* FOOTER */}
      <Footer />

    </>
  )
}

export default Home