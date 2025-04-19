// routes/auth.ts
import { Router } from "https://deno.land/x/oak/mod.ts";
import { create, verify } from "https://deno.land/x/djwt/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { User } from "../models/user.ts";

const authRouter = new Router();
const SECRET_KEY = "your-secret-key"; // Use env variable in production

// Register endpoint
authRouter.post("/api/auth/register", async (ctx) => {
  const body = await ctx.request.body().value;
  const { username, email, password } = body;

  const db = ctx.state.db;
  const usersCollection = db.collection<User>("users");

  // Check if user exists
  const userExists = await usersCollection.findOne({ email });
  if (userExists) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Email already in use" };
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password);

  // Create user
  const userId = await usersCollection.insertOne({
    username,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  });

  const user = await usersCollection.findOne({ _id: userId });

  // Create JWT
  const jwt = await create(
    { alg: "HS512", typ: "JWT" },
    { _id: userId, username, email, exp: Date.now() + 24 * 60 * 60 * 1000 },
    SECRET_KEY,
  );

  ctx.cookies.set("auth_token", jwt, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60, // 1 day
  });

  ctx.response.status = 201;
  ctx.response.body = {
    message: "User created successfully",
    user: {
      _id: userId,
      username,
      email,
    },
  };
});

// Login endpoint
authRouter.post("/api/auth/login", async (ctx) => {
  const body = await ctx.request.body().value;
  const { email, password } = body;

  const db = ctx.state.db;
  const usersCollection = db.collection<User>("users");

  // Find user
  const user = await usersCollection.findOne({ email });
  if (!user) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Invalid credentials" };
    return;
  }

  // Compare password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Invalid credentials" };
    return;
  }

  // Create JWT
  const jwt = await create(
    { alg: "HS512", typ: "JWT" },
    {
      _id: user._id,
      username: user.username,
      email: user.email,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    },
    SECRET_KEY,
  );

  ctx.cookies.set("auth_token", jwt, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60, // 1 day
  });

  ctx.response.body = {
    message: "Login successful",
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
  };
});

// Verify session endpoint
authRouter.get("/api/auth/verify", async (ctx) => {
  const token = ctx.cookies.get("auth_token");
  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Unauthorized" };
    return;
  }

  try {
    const payload = await verify(token, SECRET_KEY);
    ctx.response.body = {
      _id: payload._id,
      username: payload.username,
      email: payload.email,
    };
  } catch (error) {
    ctx.cookies.delete("auth_token");
    ctx.response.status = 401;
    ctx.response.body = { message: "Invalid or expired token" };
  }
});

// Logout endpoint
authRouter.post("/api/auth/logout", (ctx) => {
  ctx.cookies.delete("auth_token");
  ctx.response.body = { message: "Logged out successfully" };
});

export { authRouter };
