import "../styles/footer.css"
import logo from "../assets/logo.png"
import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="footer">

      <div className="footerContainer">

        <div className="footerLeft">
          <img
            className="footerLogo"
            src={logo}
            alt="Sulingo Logo"
          />
        </div>

        <div className="footerLinks">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footerSocial">
          <div className="social instagram">IG</div>
          <div className="social linkedin">in</div>
          <div className="social pinterest">P</div>
        </div>

      </div>

      <div className="copyright">
        © 2026 Sulingo — Where Hands Speak. All rights reserved.
      </div>

    </footer>
  )
}

export default Footer