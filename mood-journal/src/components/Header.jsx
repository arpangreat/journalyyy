import React from "react";
import "./Header.css";

const Header = ({ user, onLogout }) => {
  if (!user) return null;

  return (
    <header className="app-header">
      <div className="logo">Daily Mood Journal</div>
      <div className="user-menu">
        <span className="username">
          Hi, {user.username || user.email.split("@")[0]}
        </span>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
};

export default Header;
