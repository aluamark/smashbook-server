import Post from "../models/Post.js";
import User from "../models/User.js";

// CREATE
export const createPost = async (req, res) => {
	try {
		const { userId, description } = req.body;
		const user = await User.findById(userId);
		let newPost = null;

		if (req.res.req.hasOwnProperty("file")) {
			newPost = new Post({
				userId,
				firstName: user.firstName,
				lastName: user.lastName,
				description,
				userPicturePath: user.picturePath,
				picturePath: req.res.req.file.path,
				likes: [],
				comments: [],
			});
		} else {
			newPost = new Post({
				userId,
				firstName: user.firstName,
				lastName: user.lastName,
				description,
				userPicturePath: user.picturePath,
				likes: [],
				comments: [],
			});
		}

		await newPost.save();

		const friends = user.friends.map((friend) => friend);
		friends.push(userId);
		const friendsPosts = await Post.find({ userId: { $in: friends } });

		res.status(201).send(friendsPosts);
	} catch (error) {
		res.status(409).send({ error: error.message });
	}
};

// READ
export const getFeedPosts = async (req, res) => {
	try {
		const userId = req.res.req.user.id;
		const { friends } = await User.findById(userId).select("friends");
		friends.push(userId);
		const friendsPosts = await Post.find({ userId: { $in: friends } });

		res.status(200).send(friendsPosts);
	} catch (error) {
		res.status(404).send({ error: error.message });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { id } = req.params;
		const posts = await Post.find({ userId: id });

		res.status(200).send(posts);
	} catch (error) {
		res.status(404).send({ error: error.message });
	}
};

// UPDATE
export const likePost = async (req, res) => {
	try {
		const { id } = req.params;
		const { userId } = req.body;
		const post = await Post.findById(id);

		const isLiked = post.likes.filter((liker) => liker.userId === userId);

		if (isLiked.length !== 0) {
			post.likes = post.likes.filter((liker) => liker.userId !== userId);
		} else {
			post.likes.push(req.body);
		}

		const updatedPost = await post.save();

		res.status(201).send(updatedPost);
	} catch (error) {
		res.status(404).send({ error: error.message });
	}
};

export const addComment = async (req, res) => {
	try {
		const { id } = req.params;
		const { userId, comment, userPicturePath, firstName, lastName } = req.body;

		const post = await Post.findById(id);

		post.comments.push({
			userId,
			comment,
			userPicturePath,
			firstName,
			lastName,
		});

		await post.save();
		res.status(201).send(post);
	} catch (error) {
		res.status(404).send({ error: error.message });
	}
};
