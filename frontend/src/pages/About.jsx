import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import teamPhoto from "../assets/team.jpeg"

import "../styles/about.css"

function About(){

const values = [

{
icon:"❤️",
title:"Inclusivity",
description:"We believe everyone deserves the chance to communicate and connect, regardless of hearing ability."
},

{
icon:"🌍",
title:"Accessibility",
description:"Sulingo is designed to be accessible to all — free, mobile-friendly, and available in multiple sign languages."
},

{
icon:"👥",
title:"Community",
description:"We foster a welcoming community where deaf and hearing individuals learn from and support each other."
},

{
icon:"💡",
title:"Innovation",
description:"Through gamification and modern technology, we make learning sign language engaging and effective."
}

]

return(

<div className="aboutPage">

<Navbar/>

<section className="aboutSection">

<h1 className="aboutTitle">
About <span>Sulingo</span>
</h1>

<p className="aboutIntro">

Sulingo is on a mission to bridge the communication gap between deaf and hearing communities. 
Through our gamified platform, we make sign language learning accessible, fun, and impactful for everyone.

</p>


{/* Mission */}

<h2 className="missionTitle">Our Mission</h2>

<div className="missionBox">

<p>

Over 430 million people worldwide are deaf or hard of hearing, yet less than 2% of the general population knows sign language.
Sulingo aims to change that by making sign language education free, gamified, and available to everyone — creating a world where hands truly speak.

</p>

</div>


<h2 className="valuesTitle">Our Values</h2>

<p className="valuesDescription">

We believe these core values guide everything we do at Sulingo. They shape our mission and inspire our team every day.

</p>

<div className="valuesGrid">

{values.map((v)=>(

<div className="valueCard" key={v.title}>

<div className="valueIcon">
{v.icon}
</div>

<div>

<h3>{v.title}</h3>

<p>{v.description}</p>

</div>

</div>

))}

</div>

<h2 className="teamTitle">Meet Our Team</h2>

<div className="teamPhotoContainer">
<img src={teamPhoto} alt="Sulingo Team" className="teamPhoto"/>
</div>

</section>

<Footer/>

</div>

)

}

export default About