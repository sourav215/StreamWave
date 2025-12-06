import { loginUser, userRegistration, verifyUserOtp } from "@/controllers/auth.controller";
import express from "express";

const router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUserOtp);
router.post("/login-user", loginUser);

export default router;
