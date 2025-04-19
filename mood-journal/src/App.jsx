import React, { useEffect, useState } from "react";
import "./App.css";
import JournalEntryForm from "./components/JournalEntryForm";
import JournalEntryList from "./components/JournalEntryList";
import MoodAnalysis from "./components/MoodAnalysis";
import AuthForm from "./components/AuthForm";
import Header from "./components/Header";

function App() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          fetchEntries(userData._id);
        }
      } catch (err) {
        console.error("Authentication error:", err);
      }
    };

    checkAuth();
  }, []);

  const fetchEntries = async (userId) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/entries/user/${userId}`,
        {
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        setError("Failed to fetch entries");
      }
    } catch (err) {
      setError("Network error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    fetchEntries(userData._id);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setEntries([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const addEntry = (newEntry) => {
    setEntries([newEntry, ...entries]);
  };

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />

      {!user ? <AuthForm onLogin={handleLogin} /> : (
        <div className="content">
          <JournalEntryForm userId={user._id} onEntryAdded={addEntry} />
          <div className="entries-container">
            {isLoading ? <p>Loading entries...</p> : (
              <>
                <MoodAnalysis entries={entries} />
                <JournalEntryList entries={entries} />
              </>
            )}
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
