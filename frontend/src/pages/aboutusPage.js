import React, { useState, useEffect } from "react";
import map from "../assets/map.png";
import "../styles/aboutusPage.css";

function AboutUs(){
    return(
        <div className="abtUsContainer">
            <h1 className="abtTitle1">About Barangay 58</h1>

            <div className="abtUsContent">
                <div className="abtUsMap">
                    <img src = {map} alt="Map of Barangay 58"/>
                    <p>Old Map of Pasay City. Image source: Society of History</p>
                </div>

                <div className="abtUsHistory">
                    <h1>HISTORY</h1>
                    <br /><br />
                    <p>
                        Barangay 58, located in District 2 of Pasay City, has a long and evolving history. 
                        It was established during the tenure of Mayor Pablo Cuneta, one of the longest-serving mayors in Philippine history.
                        <br /><br />
                        During the Martial Law era, Mayor Cuneta initiated a major restructuring of Pasay City's administrative divisions, 
                        increasing the number of barangays from 189 to 487. The goal was to improve local governance by creating smaller, 
                        more manageable communities that could efficiently address the needs of their residents.
                        <br /><br />
                        However, as the city developed and governance structures were reassessed, the number of barangays was later 
                        reduced to 200, including Barangay 58. Despite these changes, Barangay 58 has remained an integral part of Pasay City, 
                        adapting to urbanization and modernization over the years.
                    </p>
                </div>
            </div>

            <h1 className="abtTitle2">Feast of Santa Clara De Montefalco</h1>

        </div>
    );
}

export default AboutUs;

