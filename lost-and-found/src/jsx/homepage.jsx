import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import '../styling/homepage.css';

const HomePage = () => {
  // State variables for lost and found items
  const [lostItemsCount, setLostItemsCount] = useState(0); // Initial lost items count aaa
  const [foundItemsCount, setFoundItemsCount] = useState(0); // Initial found items count
  const [notificationCount, setNotificationCount] = useState(0); // Initial notification count
  const [isNotificationVisible, setIsNotificationVisible] = useState(false); // Control visibility of notification bar
  const [notifications, setNotifications] = useState([]); // Store notifications

  // Function to simulate a new report
  const issueReport = () => {
    setLostItemsCount(prevCount => prevCount + 1); 
    setNotificationCount(prevCount => prevCount + 1); // Increase notification count
    setNotifications(prevNotifications => [...prevNotifications, `New report for lost item ${lostItemsCount + 1}`]);
  };

  // Function to toggle the notification bar visibility
  const toggleNotification = () => {
    setIsNotificationVisible(prevState => !prevState);
  };

  return (
    <div className="homepage-container">
      <header className="navbar">
        <div className="logo-section">
          <img src="settings.png" alt="Tsaaritsa Logo" className="logo" />
          <h1 className="brand-name">Lost and Found</h1>
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/lost-items" className="nav-link">Lost Items</Link>
          <Link to="/my-items" className="nav-link">My Items</Link>
        </nav>
        <button 
          className="notification-bell" 
          onClick={toggleNotification} 
          title={`${notificationCount} notifications`}
          aria-label="Notifications"
        >
          <img src="bell.png" alt="Notification" />
          <span className="notification-count">{notificationCount}</span>
        </button>
      </header>

      {isNotificationVisible && (
        <div className="notification-bar">
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <p key={index}>{notif}</p>
            ))
          ) : (
            <p>No new notifications</p>
          )}
        </div>
      )}

      <main className="main-section">
        <div className="text-section">
          <h2 className="main-heading">The lost items are in DO’s hands.</h2>
          <p className="main-subheading">
            Welcome to our page, the easy way to manage lost and found items on campus. Quickly report and locate missing belongings, helping students reconnect with their items.
          </p>
        </div>

        {/* Horizontal line above stats */}
        <hr className="divider" />

        <div className="bottom-section">
          <div className="stats-section">
            <div className="stat-box">
              <h3>{lostItemsCount}+</h3>
              <p>Lost Items</p>
            </div>
            <div className="stat-box">
              <h3>{foundItemsCount}+</h3>
              <p>Found Items</p>
            </div>
          </div>
          <button className="report-button" onClick={issueReport}>
            ISSUE A REPORT →
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
