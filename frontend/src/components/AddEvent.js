import React, { useState } from 'react';
import '../styles/AddEvent.css';

function AddEvent({ onClose, onAddEvent }) {
    const [eventData, setEventData] = useState({
        name: '',
        date: '',
        timeStart: '',
        timeEnd: '',
        venue: '',
        description: '',
        image: null
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must not be larger than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result;
                setEventData(prev => ({
                    ...prev,
                    imageUrl: imageUrl
                }));
                setImagePreview(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();


        const formattedDate = new Date(eventData.date).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });

        const formatTime = (time) => {
            const [hours, minutes] = time.split(':');
            const ampm = hours >= 12 ? 'pm' : 'am';
            const formattedHours = hours % 12 || 12;
            return `${formattedHours}:${minutes} ${ampm}`;
        };

        const formattedEventData = {
            ...eventData,
            date: formattedDate,
            timeStart: formatTime(eventData.timeStart),
            timeEnd: formatTime(eventData.timeEnd)
        };

        onAddEvent(formattedEventData);
    };

    return (
        <div className="add-event-container">
            <div className="add-event-header">
                <h2>Add New Event</h2>
                <button className="close-button" onClick={onClose}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="add-event-form">
                <div className="form-section">
                    <h3>Event Details</h3>

                    <div className="form-group">
                        <label htmlFor="name">Event Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={eventData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={eventData.date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="timeStart">Time Start</label>
                            <input
                                type="time"
                                id="timeStart"
                                name="timeStart"
                                value={eventData.timeStart}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="timeEnd">Time End</label>
                            <input
                                type="time"
                                id="timeEnd"
                                name="timeEnd"
                                value={eventData.timeEnd}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="venue">Venue</label>
                        <input
                            type="text"
                            id="venue"
                            name="venue"
                            value={eventData.venue}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={eventData.description}
                            onChange={handleInputChange}
                            required
                            rows="4"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Image Upload</h3>
                    <div className="image-upload-area">
                        {imagePreview ? (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Event preview" />
                                <button
                                    type="button"
                                    className="remove-image"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setEventData(prev => ({ ...prev, image: null }));
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <i className="fas fa-cloud-upload-alt"></i>
                                <p>Upload Image</p>
                                <span>Image must not be larger than 2mb</span>
                            </div>
                        )}
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="image" className="select-image-btn">
                            Select Image
                        </label>
                    </div>
                </div>

                <button type="submit" className="upload-event-btn">
                    Upload Event
                </button>
            </form>
        </div>
    );
}

export default AddEvent;
