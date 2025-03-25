import React, { useState, useEffect } from 'react';
import '../styles/Admin.css';
import brgyLoginPageLogo from '../assets/brgyLoginPageLogo.png';
import EventsManager from '../components/EventsManager';

function Admin() {
    const [activeSection, setActiveSection] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Mock data - replace with actual API calls
    const mockRequests = [
        {
            name: "John Doe",
            sex: "Male",
            birthday: "1990-01-01",
            address: "123 Main St, Barangay 58",
            contactNo: "09123456789",
            email: "john@example.com",
            typeOfRequest: "Barangay Clearance",
            purpose: "Employment",
            copies: 2,
            status: "Pending"
        }
        // Add more mock data as needed
    ];

    useEffect(() => {
        // Replace with actual API call
        setRequests(mockRequests);
    }, []);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'green';
            case 'rejected': return 'red';
            case 'for pickup': return 'blue';
            case 'pending': return 'orange';
            default: return 'black';
        }
    };

    const filteredRequests = requests.filter(request => {
        const matchesType = typeFilter === 'All' || request.typeOfRequest === typeFilter;
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
                            <div className="avatar">
                                <img src={brgyLoginPageLogo} alt="Barangay Logo" />
                            </div>
                            <div className="notifications">
                                <i className="fas fa-bell"></i>
                            </div>
                        </div>
                    </header>
                    {activeSection === 'requests' ? (
                        <div className="dashboard">
                            <div className="dashboard-header">
                                <div className="header-top">
                                    <h1>Request ({filteredRequests.length})</h1>
                                    <button className="add-request-btn">+ Add Request</button>
                                </div>
                                <div className="filters">
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Barangay Clearance">Barangay Clearance</option>
                                        <option value="Certificate of Residency">Certificate of Residency</option>
                                        {/* Add more options as needed */}
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
                                                <td>{request.name}</td>
                                                <td>{request.sex}</td>
                                                <td>{request.birthday}</td>
                                                <td>{request.address}</td>
                                                <td>{request.contactNo}</td>
                                                <td>{request.email}</td>
                                                <td>{request.typeOfRequest}</td>
                                                <td>{request.purpose}</td>
                                                <td>{request.copies}</td>
                                                <td>
                                                    <span style={{ color: getStatusColor(request.status) }}>
                                                        {request.status}
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
