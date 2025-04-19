package main

import (
	"encoding/json"
	"log"
	"math"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// JournalEntry represents the input data for analysis
type JournalEntry struct {
	Content string `json:"content"`
	Title   string `json:"title"`
}

// MoodAnalysis represents the output of the mood analysis
type MoodAnalysis struct {
	MoodScore float64 `json:"moodScore"`
	Advice    string  `json:"advice"`
}

// SentimentWord maps a word to its sentiment score
type SentimentWord struct {
	Word  string
	Score float64
}

// Simple sentiment dictionary for demonstration
var sentimentDictionary = []SentimentWord{
	{"happy", 8.0},
	{"glad", 7.5},
	{"good", 7.0},
	{"nice", 6.5},
	{"ok", 5.5},
	{"fine", 5.0},
	{"neutral", 5.0},
	{"tired", 4.0},
	{"sad", 3.0},
	{"angry", 2.5},
	{"upset", 2.0},
	{"depressed", 1.5},
	{"terrible", 1.0},
	{"love", 9.0},
	{"enjoy", 8.0},
	{"hate", 1.5},
	{"excited", 8.5},
	{"worried", 3.5},
	{"anxious", 3.0},
	{"stressed", 2.5},
	{"relaxed", 7.0},
	{"calm", 6.5},
	{"frustrated", 3.0},
	{"disappointed", 3.5},
	{"grateful", 8.0},
	{"thankful", 8.0},
	{"proud", 7.5},
	{"confident", 7.0},
	{"lonely", 3.0},
	{"overwhelmed", 2.5},
}

func main() {
	r := mux.NewRouter()

	// AI mood analysis endpoint
	r.HandleFunc("/analyze", analyzeMood).Methods("POST")

	// CORS handling
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:8000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	handler := c.Handler(r)

	// Server startup
	log.Println("AI Service running on http://localhost:9000")
	log.Fatal(http.ListenAndServe(":9000", handler))
}

func analyzeMood(w http.ResponseWriter, r *http.Request) {
	var entry JournalEntry
	err := json.NewDecoder(r.Body).Decode(&entry)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Analyze mood from content using basic sentiment analysis
	moodScore := performSentimentAnalysis(entry.Content)

	// Generate advice based on mood score and content
	advice := generateAdvice(moodScore, entry.Content)

	analysis := MoodAnalysis{
		MoodScore: moodScore,
		Advice:    advice,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analysis)
}

func performSentimentAnalysis(content string) float64 {
	// Basic sentiment analysis implementation
	words := strings.Fields(strings.ToLower(content))
	if len(words) == 0 {
		return 5.0 // Neutral score for empty content
	}

	totalScore := 0.0
	matchCount := 0

	for _, word := range words {
		// Clean the word of punctuation
		cleanWord := strings.Trim(word, ".,!?;:()")

		// Check if word exists in dictionary
		for _, sentimentWord := range sentimentDictionary {
			if strings.Contains(cleanWord, sentimentWord.Word) {
				totalScore += sentimentWord.Score
				matchCount++
				break
			}
		}
	}

	// Calculate average score with a neutral baseline
	if matchCount > 0 {
		// Weight the result so it's not too extreme
		return 5.0 + (totalScore/float64(matchCount)-5.0)*0.7
	}

	return 5.0 // Default neutral score
}

func generateAdvice(moodScore float64, content string) string {
	// Round mood score to nearest 0.5
	roundedScore := math.Round(moodScore*2) / 2

	// Generate personalized advice based on mood score
	switch {
	case roundedScore >= 8.5:
		return "Your mood is excellent! This is a great time to tackle challenging tasks or help others. Consider journaling about what made today so positive so you can reference it later."

	case roundedScore >= 7.5:
		return "You're in a very good mood today. Try to identify the factors contributing to your positive state and consider how to incorporate more of these elements into your daily routine."

	case roundedScore >= 6.5:
		return "You're feeling pretty good today. This is a good time for creative activities or social connection. Remember these positive feelings when you encounter challenges."

	case roundedScore >= 5.5:
		return "Your mood is fairly positive. Consider activities that might further elevate your mood, like a brief walk outside, listening to uplifting music, or connecting with a friend."

	case roundedScore >= 4.5:
		return "You seem to be feeling neutral today. This could be a good time for reflection or planning. Consider what small steps might shift your day in a more positive direction."

	case roundedScore >= 3.5:
		return "You're feeling a bit low today. Consider some self-care activities like going for a walk, practicing mindfulness, or engaging in a hobby you enjoy."

	case roundedScore >= 2.5:
		return "Your journal suggests you're feeling down. Try to be kind to yourself today. Simple activities like light exercise, calling a friend, or spending time in nature might help lift your spirits."

	default:
		return "I notice your mood appears quite low today. Remember that emotions are temporary and can change. Consider talking to someone you trust, practicing self-compassion, or engaging in activities that have helped you feel better in the past."
	}
}
