import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/auth.css"
import logo from "../assets/logo.png"

function Login() {

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e)=>{
    e.preventDefault()

    if(username && password){
      localStorage.setItem("user",username)
      navigate("/levels")
    }
  }

  return(

    <div className="authPage">

      <div className="authOverlay"></div>

      <div className="authCard">

        <img src={logo} alt="Sulingo" className="authLogo"/>

        <h2>Welcome Back</h2>
        <p>Sign in to continue learning</p>

        <form onSubmit={handleSubmit}>

          <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          />

          <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          />

          <button type="submit">
            Login
          </button>

        </form>

        <p className="authSwitch">
          Don't have an account?
          <Link to="/register"> Sign Up</Link>
        </p>

      </div>

    </div>

  )
}

export default Login