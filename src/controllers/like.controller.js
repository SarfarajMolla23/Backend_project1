import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const userId = req.user._id;

  // Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Check if the user has already liked the video
  const existingLike = await Like.findOne({ user: userId, video: videoId });

  if (existingLike) {
    // If the user has already liked, unlike it (remove the like)
    await existingLike.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Like removed from video"));
  } else {
    // If the user has not liked yet, create a new like
    await Like.create({ user: userId, video: videoId });
    return res
      .status(201)
      .json(new ApiResponse(201, null, "Like added to video"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  const userId = req.user._id;

  // Validate commentId
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Check if the user has already liked the comment
  const existingLike = await Like.findOne({ user: userId, comment: commentId });

  if (existingLike) {
    // Unlike the comment if already liked
    await existingLike.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Like removed from comment"));
  } else {
    // Like the comment if not liked yet
    await Like.create({ user: userId, comment: commentId });
    return res
      .status(201)
      .json(new ApiResponse(201, null, "Like added to comment"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  const userId = req.user._id;

  // Validate tweetId
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Check if the user has already liked the tweet
  const existingLike = await Like.findOne({ user: userId, tweet: tweetId });

  if (existingLike) {
    // Unlike the tweet if already liked
    await existingLike.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Like removed from tweet"));
  } else {
    // Like the tweet if not liked yet
    await Like.create({ user: userId, tweet: tweetId });
    return res
      .status(201)
      .json(new ApiResponse(201, null, "Like added to tweet"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;

  // Fetch all liked videos by the user
  const likedVideos = await Like.find({
    user: userId,
    video: { $exists: true },
  })
    .populate("video") // Populating video details
    .exec();

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
