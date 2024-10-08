import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate videoId
  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Pagination logic
  const skip = (page - 1) * limit;

  // Fetch comments for the video
  const comments = await Comment.find({ video: videoId })
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 }); // Sorting comments by creation date (newest first)

  // Get total comments count for the video
  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        totalComments,
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
      },
      "Comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { text } = req.body;

  // Validate videoId
  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  // Validate text
  if (!text || text.trim() === "") {
    throw new ApiError(400, "Comment text is required");
  }

  // Create a new comment
  const comment = await Comment.create({
    user: req.user._id, // Assuming `req.user` contains the authenticated user's info
    video: videoId,
    text,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { text } = req.body;

  // Validate commentId
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }

  // Validate text
  if (!text || text.trim() === "") {
    throw new ApiError(400, "Comment text is required");
  }

  // Find the comment and check ownership
  const comment = await Comment.findOne({ _id: commentId, user: req.user._id });
  if (!comment) {
    throw new ApiError(404, "Comment not found or not owned by the user");
  }

  // Update the comment text
  comment.text = text;
  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  const { commentId } = req.params;

  // Validate commentId
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }

  // Find the comment and check ownership
  const comment = await Comment.findOne({ _id: commentId, user: req.user._id });
  if (!comment) {
    throw new ApiError(404, "Comment not found or not owned by the user");
  }

  // Delete the comment
  await comment.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted sucessfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
