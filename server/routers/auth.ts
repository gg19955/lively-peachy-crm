// server.ts (or app.ts) - Main server file
import express from "express";
import supabaseServerClient from "server/config/supabase-client";

// Auth Router
export const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabaseServerClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      avatar_url: "",
    },
  });

  if (error) {
    return res.status(400).json(error.message);
  }

  res.status(200).json({ data });
});
