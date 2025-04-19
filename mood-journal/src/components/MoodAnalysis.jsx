import React, { useEffect, useState } from "react";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./MoodAnalysis.css";

const MoodAnalysis = ({ entries }) => {
  const [moodData, setMoodData] = useState([]);
  const [timePeriod, setTimePeriod] = useState("week");
  const [currentAdvice, setCurrentAdvice] = useState("");

  useEffect(() => {
    if (entries.length) {
      const processedData = processEntries(entries, timePeriod);
      setMoodData(processedData);

      // Get the latest entry advice
      const latestEntry = entries[0];
      if (latestEntry && latestEntry.aiAdvice) {
        setCurrentAdvice(latestEntry.aiAdvice);
      } else {
        setCurrentAdvice(
          "Start journaling regularly to get personalized mood insights and advice.",
        );
      }
    }
  }, [entries, timePeriod]);

  const processEntries = (entries, period) => {
    let filteredEntries;
    const now = new Date();

    switch (period) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredEntries = entries.filter((entry) =>
          new Date(entry.createdAt) >= weekAgo
        );
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredEntries = entries.filter((entry) =>
          new Date(entry.createdAt) >= monthAgo
        );
        break;
      case "year":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredEntries = entries.filter((entry) =>
          new Date(entry.createdAt) >= yearAgo
        );
        break;
      default:
        filteredEntries = entries;
    }

    return filteredEntries.map((entry) => ({
      date: new Date(entry.createdAt).toLocaleDateString(),
      mood: entry.moodScore,
      title: entry.title || "Untitled",
    })).reverse(); // Reverse to show chronological order
  };

  if (!entries.length) {
    return null;
  }

  return (
    <div className="mood-analysis">
      <h2>Your Mood Trends</h2>
      <div className="time-filters">
        <button
          className={timePeriod === "week" ? "active" : ""}
          onClick={() => setTimePeriod("week")}
        >
          Week
        </button>
        <button
          className={timePeriod === "month" ? "active" : ""}
          onClick={() => setTimePeriod("month")}
        >
          Month
        </button>
        <button
          className={timePeriod === "year" ? "active" : ""}
          onClick={() => setTimePeriod("year")}
        >
          Year
        </button>
      </div>

      <div className="mood-chart">
        {moodData.length > 1
          ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip
                  formatter={(value, name) => [value, "Mood Score"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Mood"
                />
              </LineChart>
            </ResponsiveContainer>
          )
          : (
            <p className="chart-placeholder">
              Add more entries to see your mood trends over time.
            </p>
          )}
      </div>

      <div className="mood-advice">
        <h3>AI Insights</h3>
        <p>{currentAdvice}</p>
      </div>
    </div>
  );
};

export default MoodAnalysis;
