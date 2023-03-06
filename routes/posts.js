import express from "express";
import {
	getFeedPosts,
	getUserPosts,
	likePost,
	addComment,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/all", verifyToken, getFeedPosts);
router.get("/:id", verifyToken, getUserPosts);
router.patch("/:id/like", verifyToken, likePost);
router.patch("/:id/comment", verifyToken, addComment);

export default router;
