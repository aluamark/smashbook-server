import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { updateUser } from "./controllers/users.js";
import { verifyToken } from "./middleware/auth.js";
import cloudinary from "./cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// CONFIG
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// FILE STORAGE
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "smashbook",
		public_id: (req, file) => Date.now() + "-" + file.originalname,
		use_filename: true,
		unique_filename: false,
		overwrite: true,
	},
});

// FILE VALIDATION
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/jpeg" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/png"
	) {
		cb(null, true);
	} else {
		cb({ error: "Unsupported file format." }, false);
	}
};

const upload = multer({ storage, fileFilter });

// ROUTES WITH FILES
app.post("/auth/register", upload.single("pictureFile"), register);
app.patch(
	"/users/updateUser",
	verifyToken,
	upload.single("pictureFile"),
	updateUser
);
app.post("/posts", verifyToken, upload.single("pictureFile"), createPost);

// ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// MONGOOSE
const PORT = process.env.PORT || 6000;
mongoose.set("strictQuery", true);
mongoose
	.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		app.listen(PORT, () => console.log(`Listening to Server Port: ${PORT}`));
	})
	.catch((error) => console.log(`${error} unable to connect.`));
