import "../styles/reqPage.css"
import step1 from "../assets/step1.png"
import step2 from "../assets/step2.png"
import step3 from "../assets/step3.png"
import step4 from "../assets/step4.png"
import numberIcon from "../assets/numberIcon.png"
import facebookIcon from "../assets/facebookIcon.png"
import emailIcon from "../assets/emailIcon.png"

function RequestTitlesandSteps() {
  return (
    <>
      <div className="reqText">
        <h1 className="reqTitle">Skip the Lines—Request Online!</h1>
        <h2 className="reqSubtext">
          No need to visit the barangay hall until your document is ready—save time and effort!
        </h2>
        <div className="reqContainer">
          <div className="reqSteps">
            <div className="reqStep">
              <img src={step1 || "/placeholder.svg"} alt="step1" className="step-icon" />
              <p className="stepsInfo">
                <strong>Fill Out the Form</strong> – Provide your details and select the type of certificate.
              </p>
            </div>

            <div className="reqStep">
              <img src={step2 || "/placeholder.svg"} alt="step2" className="step-icon" />
              <p className="stepsInfo">
                <strong>Submit Your Request</strong> – Click "Submit" and wait for confirmation.
              </p>
            </div>

            <div className="reqStep">
              <img src={step3 || "/placeholder.svg"} alt="step3" className="step-icon" />
              <p className="stepsInfo">
                <strong>Get Notified</strong> – We'll inform you when your certificate is ready.
              </p>
            </div>

            <div className="reqStep">
              <img src={step4 || "/placeholder.svg"} alt="step4" className="step-icon" />
              <p className="stepsInfo">
                <strong>Pick It Up</strong> – Visit the barangay hall to claim your document.
              </p>
            </div>

            <p className="reqNote">
              <strong>Note:</strong> Avoid submitting multiple requests for the same certificate to prevent delays. If
              you need to check your request status, please wait for the notification or contact the barangay office.
            </p>
          </div>
        </div>
      </div>

      {/* Contact information moved to the information tab */}
      <div className="reqContact">
        <h1 className="reqContactTitle">For inquiries or follow-ups, reach us at</h1>

        <div className="contact-methods">
          <div className="reqContactNumber">
            <img src={numberIcon || "/placeholder.svg"} alt="numberIcon" />
            <h2>09568231987</h2>
          </div>

          <div className="reqContactFacebook">
            <img src={facebookIcon || "/placeholder.svg"} alt="facebookIcon" />
            <h2>Barangay 58</h2>
          </div>

          <div className="reqContactEmail">
            <img src={emailIcon || "/placeholder.svg"} alt="emailIcon" />
            <h2>brgy58zone7pasay@gmail.com</h2>
          </div>
        </div>
      </div>
    </>
  )
}

export default RequestTitlesandSteps

