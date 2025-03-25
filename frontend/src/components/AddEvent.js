import React, { useState } from 'react';
import '../styles/AddEvent.css';

function AddEvent({ onClose, onAddEvent, editData = null, onEditEvent }) {
    const [eventData, setEventData] = useState(editData || {
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
    
            setEventData(prev => ({
                ...prev,
                image: file 
            }));
    
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('event_name', eventData.name);  
        formData.append('event_date', eventData.date); 
        formData.append('time_start', eventData.timeStart);
        formData.append('time_end', eventData.timeEnd);
        formData.append('venue', eventData.venue);
        formData.append('description', eventData.description);
        if (eventData.image) {
            formData.append('image', eventData.image);
        }
    
        try {
            const response = await fetch('http://localhost:5000/events/upload', {
                method: 'POST',
                body: formData
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }
    
            const result = await response.json();
            onAddEvent({
                ...eventData,
                id: result.id || Date.now(),  
                image_url: result.imageUrl,
                event_name: eventData.name,
                event_date: eventData.date,
                time_start: eventData.timeStart,
                time_end: eventData.timeEnd
            });
            onClose();
        } catch (error) {
            console.error('Error uploading event:', error);
            alert(error.message);
        }
    };
    
    return (
        <div className="add-event-container">
            <div className="add-event-header">
                <h2>{editData ? 'Edit Event' : 'Add New Event'}</h2>
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
