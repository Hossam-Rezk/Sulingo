import logo from "../assets/logo.png"
import "../styles/navbar.css"

import { useNavigate, Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

function Navbar() {

  const navigate = useNavigate()
  const location = useLocation()

  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    setUser(storedUser)
  }, [])

  const handleLoginClick = () => {
    if (user) {
      navigate("/levels")
    } else {
      navigate("/login")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    navigate("/")
  }

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Sulingo" />
        </Link>
      </div>

      {/* NAV LINKS */}
      <div className="navRight">

        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Home
        </Link>

        <Link to="/about" className={location.pathname === "/about" ? "active" : ""}>
          About Us
        </Link>

        <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>
          Contact Us
        </Link>

        {user ? (
          <button className="loginBtn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="loginBtn" onClick={handleLoginClick}>
            Login
          </button>
        )}

      </div>

    </nav>
  )
}

export default Navbar