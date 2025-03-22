import React from "react";
import "../styles/teamPage.css";

import kapMembers from "../assets/kapMembers.png";
import kap from "../assets/kap.jpg";
import april from "../assets/april.png";
import lalain from "../assets/lalain.png";
import harold from "../assets/harold.png";
import jovic from "../assets/jovic.png";
import thomas from "../assets/thomas.png";
import antonio from "../assets/antonio.png";
import gabriel from "../assets/gabriel.png";
import precy from "../assets/precy.png";
import ruel from "../assets/ruel.png";

import ivan from "../assets/ivan.png";
import william from "../assets/william.png";
import rojean from "../assets/rojean.png";
import aaron from "../assets/aaron.png";
import thomasSk from "../assets/thomas-sk.png";
import kepperpaul from "../assets/kepperpaul.png";
import michael from "../assets/michael.png";
import cris from "../assets/cris.png";
import skTeam from "../assets/sk-team.jpg";

function TeamPage() {
    return (
        <div className="teamPage">
            
            <div className="teamHeader">
                <h1 className="teamTitle">Sangguniang Barangay</h1>
                <h2 className="teamSubtext">Leaders Committed to Community Service</h2>
                <p className="teamDesc">
                    The Sangguniang Barangay is dedicated to governing and improving our community.
                    Through leadership, transparency, and service, we ensure the well-being and development of our barangay.
                </p>
            </div>

            <div className="kapMembersContainer">
                <img src={kapMembers} alt="Kapitan and Kagawads" className="kapMembers" />
            </div>

    
            <div className="barangayChairman">
                <img src={kap} alt="Barangay Chairman" className="chairmanImage" />
                <p className="chairmanName">Hon. Andrea Amor "AA" D. Mercado</p>
                <p className="chairmanTitle">Barangay Chairwoman</p>
            </div>

            <div className="teamMembersGrid">
                <div className="teamMember">
                    <img src={april} alt="April B. Santos" />
                    <p className="teamMemberName">April B. Santos</p>
                    <p className="teamMemberTitle">Secretary</p>
                </div>
                <div className="teamMember">
                    <img src={lalain} alt="Lalaine M. Del Corro" />
                    <p className="teamMemberName">Lalaine M. Del Corro</p>
                    <p className="teamMemberTitle">Treasurer</p>
                </div>
            </div>

            <div className="teamMembersGrid3">
                <div className="teamMember">
                    <img src={harold} alt="Harold V. Morata" />
                    <p className="teamMemberName">Harold V. Morata</p>
                    <p className="teamMemberTitle">Committee on BDRRM & Sanitation</p>
                </div>
                <div className="teamMember">
                    <img src={thomas} alt="Thomas O. Binarao" />
                    <p className="teamMemberName">Thomas O. Binarao</p>
                    <p className="teamMemberTitle">Committee on Human Rights, Law & Justice</p>
                </div>
                <div className="teamMember">
                    <img src={jovic} alt="Jovic B. Palompon" />
                    <p className="teamMemberName">Jovic B. Palompon</p>
                    <p className="teamMemberTitle">Committee on Appropriation, Health & Religion</p>
                </div>
            </div>

            <div className="teamMembersGrid3">
                <div className="teamMember">
                    <img src={antonio} alt="Antonio C. Aguilar" />
                    <p className="teamMemberName">Antonio C. Aguilar</p>
                    <p className="teamMemberTitle">Committee on Education, ALS & Business Programs</p>
                </div>
                <div className="teamMember">
                    <img src={precy} alt="Precy G. Lopez" />
                    <p className="teamMemberName">Precy G. Lopez</p>
                    <p className="teamMemberTitle">Committee on Clean & Green / Beautification</p>
                </div>
                <div className="teamMember">
                    <img src={ruel} alt="Ruel A. Buan" />
                    <p className="teamMemberName">Ruel A. Buan</p>
                    <p className="teamMemberTitle">Committee on Public Works & Infrastructure / Livelihood</p>
                </div>
            </div>

            <div className="teamMembersGrid">
                <div className="teamMember">
                    <img src={gabriel} alt="Gabriel P. Fortun" />
                    <p className="teamMemberName">Gabriel P. Fortun</p>
                    <p className="teamMemberTitle">Committee on Peace & Order / IDADAIT VAWC / Senior, PWD & Single Parent</p>
                </div>
            </div>

            <div className="teamHeader">
                <h1 className="teamTitle">Sangguniang Kabataan</h1>
                <h2 className="teamSubtext">Empowering the Youth for a Better Future</h2>
                <p className="teamDesc">
                    The SK is more than a council—it’s a movement. Through innovation, leadership, and community involvement, we empower the youth to take charge and build a better future.
                </p>
            </div>

            <div className="kapMembersContainer">
                <img src={skTeam} alt="Sk Members" className="kapMembers" />
            </div>
    
            <div className="barangayChairman">
                <img src={ivan} alt="Ivan Roven B. Villaluna" className="chairmanImage" />
                <p className="chairmanName">Ivan Roven B. Villaluna</p>
                <p className="chairmanTitle">SK Chairman</p>
            </div>

            <div className="teamMembersGrid3">
                <div className="teamMember">
                    <img src={william} alt="William Morata" />
                    <p className="teamMemberName">William Morata</p>
                    <p className="teamMemberTitle">Committee on BDRRM & Sanitation</p>
                </div>
                <div className="teamMember">
                    <img src={rojean} alt="Rojean Palompon" />
                    <p className="teamMemberName">Rojean Palompon</p>
                    <p className="teamMemberTitle">Committee on Appropriation, Health & Religion</p>
                </div>
                <div className="teamMember">
                    <img src={aaron} alt="Aaron Eugenio" />
                    <p className="teamMemberName">Aaron Eugenio</p>
                    <p className="teamMemberTitle">Committee on Public Works & Infrastructure / Livelihood</p>
                </div>
            </div>

            <div className="teamMembersGrid3">
                <div className="teamMember">
                    <img src={thomasSk} alt="Thomas O. Binarao" />
                    <p className="teamMemberName">Thomas O. Binarao</p>
                    <p className="teamMemberTitle">Committee on Human Rights, Law & Justice</p>
                </div>
                <div className="teamMember">
                    <img src={kepperpaul} alt="Kepperpaul Nurani" />
                    <p className="teamMemberName">Kepperpaul Nurani</p>
                    <p className="teamMemberTitle">Committee on Clean & Green / Beautification</p>
                </div>
                <div className="teamMember">
                    <img src={michael} alt="Michael Macapagal" />
                    <p className="teamMemberName">Michael Macapagal</p>
                    <p className="teamMemberTitle">Committee on Human Rights, Law & Justice</p>
                </div>
            </div>

            <div className="teamMembersGrid">
                <div className="teamMember">
                    <img src={cris} alt="Cris Loviel Munda" />
                    <p className="teamMemberName">Cris Loviel Munda</p>
                    <p className="teamMemberTitle">Committee on Peace & Order / IDADAIT VAWC / Senior, PWD & Single Parent</p>
                </div>
            </div>

        </div>
    );
}

export default TeamPage;
