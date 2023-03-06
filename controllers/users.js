import User from "../models/User.js";
import Post from "../models/Post.js";

// READ
export const getUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);

		res.status(200).send(user);
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
};

export const searchUsers = async (req, res) => {
	try {
		const { query } = req.params;
		const users = await User.find({
			$or: [
				{ firstName: { $regex: query, $options: "i" } },
				{ lastName: { $regex: query, $options: "i" } },
			],
		});

		res.status(200).send(users);
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
};

export const getUserFriends = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);

		const friends = await Promise.all(
			user.friends.map((id) => User.findById(id))
		);

		const formattedFriends = friends.map(
			({
				_id,
				firstName,
				lastName,
				location,
				gender,
				picturePath,
				friends,
			}) => {
				return {
					_id,
					firstName,
					lastName,
					gender,
					location,
					picturePath,
					friends,
				};
			}
		);

		res.status(200).send(formattedFriends);
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
};

// UPDATE
export const addRemoveFriend = async (req, res) => {
	try {
		const { userId, friendId } = req.params;
		const user = await User.findById(userId);
		const userAdded = await User.findById(friendId);

		const filteredUserFriends = user.friends.filter(
			(friend) => friend._id === friendId
		);
		const isFriend = filteredUserFriends.length !== 0 ? true : false;

		if (isFriend) {
			user.friends = user.friends.filter((id) => id !== friendId);
			userAdded.friends = userAdded.friends.filter((id) => id !== userId);
		} else {
			user.friends.push(userAdded);
			userAdded.friends.push(user);
		}

		await user.save();
		await userAdded.save();

		const friends = await Promise.all(
			user.friends.map((id) => User.findById(id))
		);

		const formattedFriends = friends.map(
			({
				_id,
				firstName,
				lastName,
				location,
				gender,
				picturePath,
				friends,
			}) => {
				return {
					_id,
					firstName,
					lastName,
					gender,
					location,
					picturePath,
					friends,
				};
			}
		);

		res.status(200).send(formattedFriends);
	} catch (error) {
		res.status(404).send({ error: error.message });
	}
};

export const updateUser = async (req, res) => {
	try {
		const updates = Object.keys(req.body);
		const filteredUpdates = updates.filter((update) => update !== "userId");
		const allowedUpdates = [
			"firstName",
			"lastName",
			"email",
			"pictureFile",
			"location",
			"gender",
			"facebook",
			"twitter",
		];
		const isOperationValid = filteredUpdates.every((update) =>
			allowedUpdates.includes(update)
		);

		if (!isOperationValid) {
			throw new Error({ error: "Invalid operation." });
		}

		const {
			userId,
			firstName,
			lastName,
			email,
			location,
			gender,
			facebook,
			twitter,
		} = req.body;
		const user = await User.findById(userId);

		user.firstName = firstName;
		user.lastName = lastName;
		user.email = email;
		user.location = location;
		user.gender = gender;
		user.facebook = facebook;
		user.twitter = twitter;

		if (req.res.req.hasOwnProperty("file")) {
			user.picturePath = req.res.req.file.path;
			await Post.updateMany(
				{ userId },
				{ userPicturePath: req.res.req.file.path }
			);
		}

		await user.save();

		if (!user) {
			res.status(400).send({ error: "Update profile failed." });
		}

		res.send(user);
	} catch (error) {
		res.status(404).send({ error: error.message });
	}
};
