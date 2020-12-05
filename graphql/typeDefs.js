const { gql } = require('apollo-server');

module.exports = gql`
	type Post {
		id: ID!
		body: String!
		createdAt: String!
		username: String!
		comments: [Comment]!
		likes: [Like]!
	}
	type Comment {
		id: ID!
		username: String!
		body: String!
		createdAt: String!
	}
	type Like {
		id: ID!
		username: String!
		createdAt: String!
	}

	input RegisterInput {
		username: String!
		password: String!
		confirmPassword: String!
		email: String!
	}
	type File {
		filename: String!
		mimetype: String!
		encoding: String!
		avatarUrl: String!
	}

	type User {
		id: ID!
		username: String!
		avatarUrl: String!
		token: String!
		email: String!
		createdAt: String!
	}
	type Query {
		getPosts: [Post]
		getPost(postId: ID!): Post
		getUser(userId: ID!): User
		verifyToken: User
	}
	type Mutation {
		login(username: String!, password: String!): User!
		register(registerInput: RegisterInput): User!
		createPost(body: String!): Post!
		deletePost(postId: ID!): String!
		createComment(body: String!, postId: String!): Post!
		deleteComment(postId: String!, commentId: String): Post!
		likePost(postId: String!): Post!
		upload(file: Upload!): File!
	}
	type Subscription {
		onNewPost: Post!
		onPostDelete: ID!
		onComment(postId: ID!): Post!
		onLike(postId: ID!): Post!
	}
`;
