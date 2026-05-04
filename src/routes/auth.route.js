import express from "express";
import { signUp, signIn, signOut } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validaiton.js";

const router = express.Router();

router.post("/signup", validate(registerSchema), signUp);
router.post("/signin", validate(loginSchema), signIn);
router.post("/logout", signOut);

export default router;
