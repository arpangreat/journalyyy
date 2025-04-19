import React, { useState } from "react";
import { Camera } from "lucide-react";
import "./JournalEntryForm.css";

const JournalEntryForm = ({ userId, onEntryAdded }) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitEntry = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Journal content cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("title", title);
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch("http://localhost:8000/api/entries", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const newEntry = await response.json();
        onEntryAdded(newEntry);
        setContent("");
        setTitle("");
        setImage(null);
        setPreviewUrl(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create entry");
      }
    } catch (err) {
      setError("Network error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="journal-form-container">
      <h2>Write Today's Journal</h2>
      <form onSubmit={submitEntry} className="journal-form">
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="journal-title"
        />
        <textarea
          placeholder="How was your day? Share your thoughts, feelings, and experiences..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="journal-content"
          required
        />

        <div className="form-footer">
          <div className="image-upload">
            <label htmlFor="image-input" className="upload-button">
              <Camera size={20} />
              <span>Add Image</span>
            </label>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreviewUrl(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Entry"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default JournalEntryForm;
