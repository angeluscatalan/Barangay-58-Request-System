import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EventsSlideshow.css';
import Announcement from "../assets/Announce.png";

function EventsSlideshow() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/events');
                if (!response.ok) throw new Error('Failed to fetch events');
                const data = await response.json();
                
                // Ensure we have an array of events
                if (!Array.isArray(data.events)) {
                    setEvents([]);
                    return;
                }

                // Sort by created_at date and get latest 3
                const latestEvents = [...data.events]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 3);

                setEvents(latestEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUpcomingEvents();
    }, []);

    useEffect(() => {
        if (events.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide(current => (current + 1) % events.length);
            }, 5000); // Change slide every 5 seconds

            return () => clearInterval(timer);
        }
    }, [events.length]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeString) => {
        const [hour, minute] = timeString.split(':');
        const date = new Date();
        date.setHours(hour, minute);
        return date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const goToNextSlide = () => {
        setCurrentSlide(current => (current + 1) % events.length);
    };

    const goToPrevSlide = () => {
        setCurrentSlide(current => (current - 1 + events.length) % events.length);
    };

    if (loading) {
        return <div className="slideshow-loading">Loading events...</div>;
    }

    if (events.length === 0) {
        return <div className="no-events">No upcoming events</div>;
    }

    return (
        <div className="events-slideshow-container">
            <div className="events-slideshow">
                {events.map((event, index) => (
                    <div
                        key={event.id}
                        className={`slide ${index === currentSlide ? 'active' : ''}`}
                    >
                        <div className="slide-wrapper">
                            <div className="image-container">
                                <img
                                    src={event.image_url || Announcement}
                                    alt={event.event_name}
                                    className="event-image"
                                    onClick={() => {
                                        sessionStorage.setItem('selectedEventId', event.id);
                                        navigate('/Events');
                                    }}
                                    style={{ cursor: 'pointer' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = Announcement;
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {events.length > 1 && (
                    <>
                        <button className="nav-button prev" onClick={goToPrevSlide}>
                            &#10094;
                        </button>
                        <button className="nav-button next" onClick={goToNextSlide}>
                            &#10095;
                        </button>
                    </>
                )}
            </div>

            <div className="slideshow-dots">
                {events.map((_, index) => (
                    <button
                        key={index}
                        className={`dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
}

export default EventsSlideshow;
