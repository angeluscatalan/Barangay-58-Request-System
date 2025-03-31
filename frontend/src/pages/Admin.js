import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';
import brgyLoginPageLogo from '../assets/brgyLoginPageLogo.png';
import EventsManager from '../components/EventsManager';

function Admin() {
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeSection, setActiveSection] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState(''); 

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('http://localhost:5000/requests'); 
                setRequests(response.data);
                console.log("Fetched requests:", response.data);
            } catch (error) {
                console.error('Error fetching requests:', error);
            }
        };

        fetchRequests();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.put(
                `http://localhost:5000/requests/${id}`, 
                { status: newStatus },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            setRequests((prevRequests) =>
                prevRequests.map(req => req.id === id ? { ...req, status: newStatus } : req)
            );
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // Filter requests based on type, status, and search query
    const filteredRequests = requests.filter(request => {
        const matchesType = typeFilter === 'All' || request.type_of_certificate === typeFilter;
        const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
        const matchesSearch = searchQuery === '' || 
            `${request.last_name}, ${request.first_name} ${request.middle_name || ''}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        return matchesType && matchesStatus && matchesSearch;
    });

    return (
        <>
            <div className="top-line"></div>
            <div className="admin-container">
                <div className="sidebar">
                    <div className="sidebar-header">
                        <img src={brgyLoginPageLogo} alt="Barangay Logo" className="admin-logo" />
                        <h1>BARANGAY 58</h1>
                    </div>
                    <nav>
                        <ul>
                            <li
                                className={activeSection === 'requests' ? 'active' : ''}
                                onClick={() => setActiveSection('requests')}
                            >
                                Certificate Request
                            </li>
                            <li
                                className={activeSection === 'events' ? 'active' : ''}
                                onClick={() => setActiveSection('events')}
                            >
                                Events Manager
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="main-content">
                    <header>
                        <div className="profile-section">
                            <div className="notifications">
                                <i className="fas fa-bell"></i>
                            </div>
                            <div 
                                className="avatar" 
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img src={brgyLoginPageLogo} alt="Barangay Logo" />
                            </div>
                            {showProfileMenu && (
                                <div className="profile-menu">
                                    <button 
                                        onClick={() => {
                                            localStorage.removeItem('isAuthenticated');
                                            navigate('/');
                                        }}
                                        className="logout-button"
                                    >
                                        <i className="fas fa-sign-out-alt"></i>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>
                    {activeSection === 'requests' ? (
                        <div className="dashboard">
                            <div className="dashboard-header">
                                <div className="header-top">
                                    <h1>Requests ({filteredRequests.length})</h1>
                                </div>
                                <div className="filters">
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-bar"
                                    />
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="All">All Types</option>
                                        <option value="ClearanceCert">Barangay Clearance</option>
                                        <option value="IDApp">ID Application</option>
                                        <option value="IndigencyCert">Certificate of Indigency</option>
                                        <option value="JobseekerCert">Barangay Jobseeker</option>
                                        <option value="BrgyCert">Barangay Certificate</option>
                                    </select>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="for pickup">For Pickup</option>
                                    </select>
                                </div>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>NAME</th>
                                            <th>SUFFIX</th>
                                            <th>SEX</th>
                                            <th>BIRTHDAY</th>
                                            <th>ADDRESS</th>
                                            <th>CONTACT NO.</th>
                                            <th>EMAIL</th>
                                            <th>TYPE OF REQUEST</th>
                                            <th>PURPOSE</th>
                                            <th>NO. OF COPIES</th>
                                            <th>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.map((request, index) => (
                                            <tr key={index}>
                                                <td>{`${request.last_name}, ${request.first_name} ${request.middle_name || ''}`}</td>
                                                <td>{request.suffix}</td>
                                                <td>{request.sex}</td>
                                                <td>{request.birthday ? request.birthday.split('T')[0] : ''}</td>
                                                <td>{request.address}</td>
                                                <td>{request.contact_no}</td>
                                                <td>{request.email}</td>
                                                <td>{request.type_of_certificate}</td>
                                                <td>{request.purpose_of_request}</td>
                                                <td>{request.number_of_copies}</td>
                                                <td>
                                                    <select 
                                                        value={request.status} 
                                                        onChange={(e) => updateStatus(request.id, e.target.value)}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="rejected">Rejected</option>
                                                        <option value="for pickup">For Pickup</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <EventsManager />
                    )}
                </div>
            </div>
        </>
    );
}

export default Admin;
