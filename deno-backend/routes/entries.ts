// routes/entries.ts
import { Router } from "https://deno.land/x/oak/mod.ts";
import { verify } from "https://deno.land/x/djwt/mod.ts";
import { JournalEntry } from "../models/entry.ts";

const entriesRouter = new Router();
const SECRET_KEY = "your-secret-key"; // Use env variable in production

// Middleware to check authentication
async function authMiddleware(ctx, next) {
  const token = ctx.cookies.get("auth_token");
  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Unauthorized" };
    return;
  }

  try {
    const payload = await verify(token, SECRET_KEY);
    ctx.state.user = payload;
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Invalid or expired token" };
  }
}

// Create entry endpoint
entriesRouter.post("/api/entries", authMiddleware, async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "form-data" }).value.read();
    const userId = body.fields.userId;
    const title = body.fields.title || "";
    const content = body.fields.content;

    if (!content) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Content is required" };
      return;
    }

    // Call AI service for mood analysis
    const aiResponse = await fetch("http://localhost:9000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, title }),
    });

    const aiData = await aiResponse.json();

    // Save entry to database
    const db = ctx.state.db;
    const entriesCollection = db.collection<JournalEntry>("journal_entries");

    const entryData: JournalEntry = {
      userId: { $oid: userId },
      title,
      content,
      moodScore: aiData.moodScore,
      aiAdvice: aiData.advice,
      createdAt: new Date(),
    };

    // Handle image upload if present
    if (body.files && body.files.length > 0) {
      const imageFile = body.files[0];
      // Image handling code would go here
      // For simplicity, we're skipping actual file storage
      entryData.imageUrl = `/uploads/${imageFile.filename}`;
    }

    const entryId = await entriesCollection.insertOne(entryData);

    // Get the full entry
    const entry = await entriesCollection.findOne({ _id: entryId });

    ctx.response.status = 201;
    ctx.response.body = entry;
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Server error" };
  }
});

// Get user entries endpoint
entriesRouter.get("/api/entries/user/:userId", authMiddleware, async (ctx) => {
  try {
    const { userId } = ctx.params;
    const db = ctx.state.db;
    const entriesCollection = db.collection<JournalEntry>("journal_entries");

    const entries = await entriesCollection
      .find({ userId: { $oid: userId } })
      .sort({ createdAt: -1 })
      .toArray();

    ctx.response.body = entries;
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Server error" };
  }
});

export { entriesRouter };
