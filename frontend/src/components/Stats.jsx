import "../styles/stats.css"

function Stats() {
  return (
    <section className="statsSection">

      {/* top wave */}
      <div className="topWave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="1440" height="60" fill="#24335B" />
          <path
            fill="#ffffff"
            d="M0,0 Q360,60 720,30 Q1080,0 1440,40 L1440,0 Z"
          />
        </svg>
      </div>

      <div className="statsHeader">
        <h1 className="statsTitle">
          The Need for <span>Change</span>
        </h1>
      </div>

      <div className="statsContent">

        <div className="statBox">
          <h2>430+</h2>
          <h3>million</h3>
          <p>People worldwide live with disabling hearing loss.</p>
        </div>

        <div className="statBox">
          <h2>700</h2>
          <h3>million</h3>
          <h4>by 2050</h4>
          <p>A rapidly growing global health concern.</p>
        </div>

        <div className="statBox">
          <h2>70%</h2>
          <p>Of Deaf individuals face barriers in education, healthcare, and employment.</p>
        </div>

        <div className="statBox">
          <h2>Less than 2%</h2>
          <p>Of hearing people know basic sign language.</p>
        </div>

      </div>

      {/* bottom wave */}
      <div className="bottomWave">
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="1440" height="140" fill="#24335B" />
          <path
            fill="#ffffff"
            d="M0,140 Q360,20 720,80 Q1080,140 1440,40 L1440,140 Z"
          />
        </svg>
      </div>

    </section>
  )
}

export default Stats