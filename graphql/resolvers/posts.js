const {
	UserInputError,
	AuthenticationError,
	withFilter,
} = require('apollo-server');

const Post = require('../../models/Post');
const checkAuth = require('../../utils/check-auth');
module.exports = {
	Query: {
		getPosts: async () => {
			try {
				const posts = await Post.find().sort({ createdAt: 'desc' });
				return posts;
			} catch (err) {
				throw new Error(err);
			}
		},
		getPost: async (parent, args, context, info) => {
			const { postId } = args;
			try {
				const post = await Post.findOne({ _id: postId });
				if (!post) {
					throw new Error('Post not found');
				}
				return post;
			} catch (err) {
				throw new Error(err);
			}
		},
	},
	Mutation: {
		createPost: async (parent, args, context, info) => {
			const { body } = args;
			if (body.trim() === '')
				throw new UserInputError('Body must not be empty', {
					errors: {
						body: 'Body must not be empty ',
					},
				});
			const user = checkAuth(context);
			try {
				const newPost = new Post({
					body,
					username: user.username,
					createdAt: new Date().toISOString(),
					user: user.id,
				});
				const post = await newPost.save();
				context.pubsub.publish('NEW_POST', { onNewPost: post });
				return post;
			} catch (err) {
				throw new Error(err);
			}
		},
		deletePost: async (_, { postId }, context) => {
			const user = checkAuth(context);
			const post = await Post.findById(postId);
			if (!post) throw new Error('Post not found');
			if (user.id.toString() !== post.user.toString())
				throw new AuthenticationError('Not authorised');
			try {
				await post.delete();
				context.pubsub.publish('POST_DELETE', { onPostDelete: postId });

				return 'post succesfully deleted ';
			} catch (err) {
				throw new Error(err);
			}
		},
		// TODO: createComment mutation
		createComment: async (_, { body, postId }, context, info) => {
			const user = checkAuth(context);
			if (body.trim() === '')
				throw new UserInputError('Comment must not be empty', {
					errors: {
						body: 'Comment must not be empty ',
					},
				});
			try {
				const post = await Post.findById(postId);
				if (!post) throw new Error('Post not found');
				const comment = {
					body,
					username: user.username,
					createdAt: new Date().toISOString(),
				};
				post.comments.unshift(comment);
				await post.save();
				context.pubsub.publish('ON_COMMENT', { onComment: post });
				return post;
			} catch (err) {
				throw new Error(err);
			}
		},
		// TODO: deleteComment mutation
		deleteComment: async (_, { postId, commentId }, context, info) => {
			const user = checkAuth(context);
			try {
				const post = await Post.findById(postId);
				if (!post) throw new UserInputError('Post not found');
				const indexToDelete = post.comments.findIndex(
					(comment) => comment._id.toString() === commentId.toString()
				);
				if (indexToDelete === -1) throw new Error('Comment not found');
				if (post.comments[indexToDelete].username !== user.username)
					throw new AuthenticationError('Action not allowed');
				post.comments.splice(indexToDelete, 1);

				await post.save();
				context.pubsub.publish('ON_COMMENT', { onComment: post });

				return post;
			} catch (err) {
				throw new Error(err);
			}
		},
		// TODO: likePost as toggle mutation
		likePost: async (_, { postId }, context, info) => {
			const user = checkAuth(context);
			try {
				const post = await Post.findById(postId);
				if (!post) throw new UserInputError('Post not found');
				const index = post.likes.findIndex(
					(like) => like.username === user.username
				);
				if (index === -1) {
					//add like
					post.likes.push({
						username: user.username,
						createdAt: new Date().toISOString(),
					});
				} else {
					post.likes.splice(index, 1);
				}

				await post.save();
				context.pubsub.publish('NEW_LIKE', {
					onLike: post,
				});
				return post;
			} catch (err) {
				throw new Error(err);
			}
		},
	},
	Subscription: {
		onNewPost: {
			subscribe: (parent, args, context, info) =>
				context.pubsub.asyncIterator('NEW_POST'),
		},
		onPostDelete: {
			subscribe: (parent, args, context, info) =>
				context.pubsub.asyncIterator('POST_DELETE'),
		},
		onComment: {
			subscribe: withFilter(
				(_, __, context) => context.pubsub.asyncIterator('ON_COMMENT'),
				(payload, variables) =>
					variables.postId.toString() === payload.onComment._id.toString()
			),
		},

		onLike: {
			subscribe: withFilter(
				(_, __, context) => context.pubsub.asyncIterator('NEW_LIKE'),
				(payload, variables) =>
					variables.postId.toString() === payload.onLike._id.toString()
			),
		},
	},
};
