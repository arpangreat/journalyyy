import React, { useState } from "react";
import "./JournalEntryList.css";
import { formatDistanceToNow } from "date-fns";

const JournalEntryList = ({ entries }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!entries.length) {
    return (
      <p className="no-entries">No journal entries yet. Start writing today!</p>
    );
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="journal-entries">
      <h2>Your Journal Entries</h2>
      <div className="entry-list">
        {entries.map((entry) => (
          <div
            key={entry._id}
            className={`entry-card ${
              expandedId === entry._id ? "expanded" : ""
            }`}
            onClick={() => toggleExpand(entry._id)}
          >
            <div className="entry-header">
              <h3>{entry.title || "Untitled Entry"}</h3>
              <div className="entry-meta">
                <span className="entry-date">
                  {formatDistanceToNow(new Date(entry.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                <span
                  className="mood-indicator"
                  style={{ backgroundColor: getMoodColor(entry.moodScore) }}
                >
                  {getMoodEmoji(entry.moodScore)}{" "}
                  {getMoodLabel(entry.moodScore)}
                </span>
              </div>
            </div>

            {expandedId === entry._id && (
              <div className="entry-content">
                <p>{entry.content}</p>
                {entry.imageUrl && (
                  <div className="entry-image">
                    <img src={entry.imageUrl} alt="Journal entry" />
                  </div>
                )}
                {entry.aiAdvice && (
                  <div className="ai-advice">
                    <h4>AI Insights</h4>
                    <p>{entry.aiAdvice}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions for mood visualization
const getMoodColor = (score) => {
  if (score >= 8) return "#4CAF50"; // Happy - Green
  if (score >= 6) return "#8BC34A"; // Content - Light Green
  if (score >= 4) return "#FFC107"; // Neutral - Amber
  if (score >= 2) return "#FF9800"; // Sad - Orange
  return "#F44336"; // Very Sad - Red
};

const getMoodEmoji = (score) => {
  if (score >= 8) return "😄";
  if (score >= 6) return "🙂";
  if (score >= 4) return "😐";
  if (score >= 2) return "😔";
  return "😢";
};

const getMoodLabel = (score) => {
  if (score >= 8) return "Happy";
  if (score >= 6) return "Content";
  if (score >= 4) return "Neutral";
  if (score >= 2) return "Sad";
  return "Very Sad";
};

export default JournalEntryList;
