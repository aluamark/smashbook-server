import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			min: 2,
			max: 50,
			select: true,
		},
		lastName: {
			type: String,
			required: true,
			min: 2,
			max: 50,
			select: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			select: true,
		},
		password: {
			type: String,
			required: true,
			min: 6,
			select: false,
		},
		picturePath: {
			type: String,
			default: "",
			select: true,
		},
		friends: {
			type: Array,
			default: [],
			select: true,
		},
		location: { type: String, select: true },
		gender: { type: String, select: true },
		viewedProfile: { type: String, select: true },
		impressions: { type: String, select: true },
		facebook: { type: String, default: "", select: true },
		twitter: { type: String, default: "", select: true },
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);

export default User;
