import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/auth.css"
import logo from "../assets/logo.png"

function Register() {

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // mock register
    localStorage.setItem("user", username)

    navigate("/levels")
  }

  return (

    <div className="authPage">

      <div className="authOverlay"></div>

      <div className="authCard">

        <img src={logo} alt="Sulingo" className="authLogo"/>

        <h2>Create Account</h2>

        <p>Start your sign language journey today</p>

        <form onSubmit={handleSubmit}>

          <label>
            Username
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="authError">{error}</div>}

          <button type="submit">
            Sign Up
          </button>

        </form>

        <p className="authSwitch">
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>

    </div>

  )
}

export default Register
