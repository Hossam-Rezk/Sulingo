import { useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

import "../styles/contact.css"

function Contact(){

const [form,setForm] = useState({
name:"",
email:"",
message:""
})

const handleSubmit=(e)=>{
e.preventDefault()

alert("Message sent successfully!")

setForm({
name:"",
email:"",
message:""
})
}

return(

<div className="contactPage">

<Navbar/>

<section className="contactSection">

<h1 className="contactTitle">
Contact <span>Us</span>
</h1>

<p className="contactSubtitle">
Have questions? We'd love to hear from you.
</p>

<div className="contactContainer">

{/* LEFT SIDE */}

<div className="contactInfo">

<h2>Get in Touch</h2>

<div className="infoItem">

<div className="iconBox">📧</div>

<div>
<p className="label">Email</p>
<p className="value">hello@sulingo.com</p>
</div>

</div>


<div className="infoItem">

<div className="iconBox">📞</div>

<div>
<p className="label">Phone</p>
<p className="value">01012131651</p>
</div>

</div>


<div className="infoItem">

<div className="iconBox">📍</div>

<div>
<p className="label">Location</p>
<p className="value">Available Worldwide</p>
</div>

</div>

</div>


{/* FORM */}

<div className="contactForm">

<form onSubmit={handleSubmit}>

<label>Name</label>

<input
type="text"
placeholder="Your name"
value={form.name}
onChange={(e)=>setForm({...form,name:e.target.value})}
/>


<label>Email</label>

<input
type="email"
placeholder="Your email"
value={form.email}
onChange={(e)=>setForm({...form,email:e.target.value})}
/>


<label>Message</label>

<textarea
placeholder="Your message..."
rows="5"
value={form.message}
onChange={(e)=>setForm({...form,message:e.target.value})}
/>


<button type="submit">
Send Message
</button>

</form>

</div>

</div>

</section>

<Footer/>

</div>

)

}

export default Contact