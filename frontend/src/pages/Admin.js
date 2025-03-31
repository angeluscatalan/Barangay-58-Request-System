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

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('https://barangay-58-request-system-frontend.vercel.app/requests'); 
                setRequests(response.data);
            } catch (error) {
                console.error('Error fetching requests:', error);
            }
        };

        fetchRequests();
    }, []);

    const getStatusColor = (status) => {
        if (!status) return 'black'; 
        switch (status.toLowerCase()) {
            case 'approved': return 'green';
            case 'rejected': return 'red';
            case 'for pickup': return 'blue';
            case 'pending': return 'orange';
            default: return 'black';
        }
    };

    const filteredRequests = requests.filter(request => {
        const matchesType = typeFilter === 'All' || request.certificate_type === typeFilter;
        const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
        return matchesType && matchesStatus;
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
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Barangay Clearance">Barangay Clearance</option>
                                        <option value="Certificate of Residency">Certificate of Residency</option>
                                    </select>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="For Pickup">For Pickup</option>
                                    </select>
                                </div>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>NAME</th>
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
                                                <td>{request.sex}</td>
                                                <td>{request.birthday ? request.birthday.split('T')[0] : ''}</td>
                                                <td>{request.address}</td>
                                                <td>{request.contact_no}</td>
                                                <td>{request.email}</td>
                                                <td>{request.type_of_certificate}</td>
                                                <td>{request.purpose_of_request}</td>
                                                <td>{request.number_of_copies}</td>
                                                <td>
                                                    <span style={{ color: getStatusColor(request.status || '') }}>
                                                        {request.status || 'Unknown'}
                                                    </span>
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