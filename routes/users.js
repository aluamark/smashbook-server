import express from "express";
import {
	getUser,
	getUserFriends,
	addRemoveFriend,
	searchUsers,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);
router.patch("/:userId/:friendId", verifyToken, addRemoveFriend);
router.get("/search/:query", verifyToken, searchUsers);

export default router;
