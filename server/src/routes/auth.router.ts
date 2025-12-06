import { userRegistration } from "@/controllers/auth.controller";
import express from "express";

const router = express.Router();

router.post("/user-registration", userRegistration);

export default router;
