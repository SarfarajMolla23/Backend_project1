import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const { content } = req.body;
  const userId = req.user._id;

  // Validate tweet content
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Tweet content cannot be empty");
  }

  // Create a new tweet document
  const tweet = await Tweet.create({
    content,
    user: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets

  const { userId } = req.params;

  // Validate userId
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  // Get the user's tweets
  const tweets = await Tweet.find({ user: userId }).sort({ createdAt: -1 });

  if (!tweets.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No tweets found for this user"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  // Validate tweetId
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Validate tweet content
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Updated tweet content cannot be empty");
  }

  // Check if the tweet exists
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Check if the logged-in user is the owner of the tweet
  if (tweet.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own tweets");
  }

  // Update the tweet
  tweet.content = content;
  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;
  const userId = req.user._id;

  // Validate tweetId
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Check if the tweet exists
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Check if the logged-in user is the owner of the tweet
  if (tweet.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own tweets");
  }

  // Delete the tweet
  await tweet.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
