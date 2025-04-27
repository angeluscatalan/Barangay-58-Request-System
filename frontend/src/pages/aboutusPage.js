import map from "../assets/map.png"
import BarangayPlaceholder from "../assets/facade.jpg"
import Feast from "../assets/Feast.jpg"
import opHours from "../assets/opHours.png"
import location from "../assets/location.png"
import "../styles/aboutusPage.css"
import Footer from "../components/Footer"

function AboutUs() {
  return (
    <div className="abtUsContainer">
      <h1 className="abtTitle1">About Barangay 58</h1>

      <div className="abtUsContent">
        <div className="abtUsMap">
          <img src={map} alt="Map of Barangay 58" />
          <p>Current Map of Barangay 58, Pasay City.</p>
        </div>

        <div className="abtUsHistory">
          <h1>HISTORY</h1>
          <br />
          <br />
          <p>
            Barangay 58, located in District 2 of Pasay City, has a long and evolving history. It was established during
            the tenure of Mayor Pablo Cuneta, one of the longest-serving mayors in Philippine history.
            <br />
            <br />
            During the Martial Law era, Mayor Cuneta initiated a major restructuring of Pasay City's administrative
            divisions, increasing the number of barangays from 189 to 487. The goal was to improve local governance by
            creating smaller, more manageable communities that could efficiently address the needs of their residents.
            <br />
            <br />
            However, as the city developed and governance structures were reassessed, the number of barangays was later
            reduced to 200, including Barangay 58. Despite these changes, Barangay 58 has remained an integral part of
            Pasay City, adapting to urbanization and modernization over the years.
          </p>
        </div>
      </div>

      <h1 className="abtTitle2">Feast of Santa Clara De Montefalco</h1>
      <div className="feastSection">
        <div className="feastImagePlaceholder">
          <div className="feastImage">
            <img src={Feast || "/placeholder.svg"} alt="Feast of Santa Clara De Montefalco" />
          </div>
        </div>
        <p className="feastDescription">
          Barangay 58, takes pride in its strong community spirit and rich cultural heritage. Every August 17, the
          barangay celebrates its Fiesta Day, honoring its patron saint, Santa Clara De Montefalco. The annual festival
          features religious activities, processions, street parades, and community events, fostering unity among
          residents.
        </p>
      </div>

      <div className="barangayContainer">
        <div className="barangayImage">
          <img src={BarangayPlaceholder || "/placeholder.svg"} alt="Barangay Hall" />
        </div>
        <div className="barangayText">
          <h1>Barangay 58, Zone 7 Barangay Hall</h1>
          <p>
            The Barangay 58 Barangay Hall is dedicated to providing efficient public service, ensuring that all
            residents have access to the necessary barangay documents, community assistance, and local governance
            programs.
          </p>
        </div>
      </div>

      <div className="barangayDetails">
        <div className="opHours">
          <h1>Operating Hours</h1>
          <img src={opHours || "/placeholder.svg"} alt="Operation Hours"></img>
          <ul>
            <li> Monday - Friday: 8:00 AM – 5:00 PM</li>
            <li>Saturday: 8:00 AM – 12:00 PM</li>
            <li>Closed on Sundays & Public Holidays</li>
          </ul>
        </div>

        <div className="location">
          <h1>Location</h1>
          <img src={location || "/placeholder.svg"} alt="Location"></img>
          <ul>
            <li>
              <strong>Building Name:</strong> Barangay 58, Zone 7 Barangay Hall
            </li>
            <li>
              <strong>Street Address:</strong> 312B Taylo Street Pasay City{" "}
            </li>
            <li>
              <strong>ZIP Code:</strong> 1300
            </li>
          </ul>
        </div>
      </div>

      <div className="barangayMV">
        <h1>Mission</h1>
        <p>
          Makamit ang napapanatiling pag-unlad at paglago sa pamamagitan ng pagbibigay kapangyarihan sa mga tao, wastong
          paggamit ng lupa at yaman, paghahatid ng mga pangunahing serbisyo, at pagsuporta sa mga aktibidad
          pang-ekonomiya na makikinabang sa pag-unlad ng turismo at industriya ng pangingisda ng bayan at lalawigan, sa
          pamamagitan ng pakikilahok at produktibong mamamayan at isang makakalikasang kapaligiran.
        </p>

        <h1>Vision</h1>
        <p>
          Bilang isang komunidad na may sariling kakayahan at may malalakas at tapat na mga lider, kung saan ang mga tao
          ay binibigyan ng mga pangunahing pangangailangan at pasilidad, mga aktibidad na naglilikha ng kita na
          magdadala sa napapanatiling pag-unlad, ginagawa itong imbakan ng pagkain ng lalawigan, isang nangungunang
          sentro ng turismo, at isang lugar na eco-friendly at tahimik na tirahan.
        </p>
      </div>
      <Footer />
    </div>
  )
}

export default AboutUs

