// main.ts
import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";
import { authRouter } from "./routes/auth.ts";
import { entriesRouter } from "./routes/entries.ts";

// Connect to MongoDB using the updated MongoDB driver
const client = new MongoClient();

try {
  // Connect to MongoDB (update connection string as needed)
  await client.connect("mongodb://127.0.0.1:27017");
  console.log("Connected to MongoDB");

  const db = client.database("mood_journal");

  // Create Oak application
  const app = new Application();

  // Set up middleware
  app.use(oakCors({ credentials: true, origin: ["http://localhost:3000"] }));

  // Inject database connection
  app.use(async (ctx, next) => {
    ctx.state.db = db;
    await next();
  });

  // Set up routes
  app.use(authRouter.routes());
  app.use(authRouter.allowedMethods());
  app.use(entriesRouter.routes());
  app.use(entriesRouter.allowedMethods());

  // Start server
  console.log("Server running on http://localhost:8000");
  await app.listen({ port: 8000 });
} catch (err) {
  console.error("MongoDB connection error:", err);
}
