import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination

  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  // Build the filter object
  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" }; // Case-insensitive search on title
  }
  if (userId && isValidObjectId(userId)) {
    filter.user = userId; // Filter by user
  }

  // Get videos with pagination and sorting
  const videos = await Video.find(filter)
    .sort({ [sortBy]: sortType === "desc" ? -1 : 1 }) // Sort dynamically based on sortBy and sortType
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalVideos = await Video.countDocuments(filter); // Count total videos

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, totalVideos },
        "Videos fetched successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  const userId = req.user._id;
  const videoPath = req.file?.path; // Assume video file is uploaded as `file` in the request

  // Validate inputs
  if (!videoPath) throw new ApiError(400, "Video file is missing");
  if (!title || !description)
    throw new ApiError(400, "Title and description are required");

  // Upload video to Cloudinary
  const videoUpload = await uploadOnCloudinary(videoPath, "video");

  if (!videoUpload.url) {
    throw new ApiError(500, "Error uploading video to Cloudinary");
  }

  // Create the video document
  const video = await Video.create({
    title,
    description,
    user: userId,
    videoUrl: videoUpload.url,
    thumbnail: videoUpload.thumbnail, // Assuming the video has a thumbnail
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  // Validate video ID
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Find the video by ID
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body;
  const userId = req.user._id;
  const thumbnailPath = req.file?.path; // Assume new thumbnail image is uploaded as `file`

  // Validate video ID
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Find the video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Ensure the video belongs to the user
  if (video.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  // Update the video
  if (title) video.title = title;
  if (description) video.description = description;

  // If thumbnail is provided, upload it and update
  if (thumbnailPath) {
    const thumbnailUpload = await uploadOnCloudinary(thumbnailPath, "image");
    if (thumbnailUpload.url) {
      video.thumbnail = thumbnailUpload.url;
    }
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  const userId = req.user._id;

  // Validate video ID
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Find the video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Ensure the video belongs to the user
  if (video.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // Remove the video
  await video.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const userId = req.user._id;

  // Validate video ID
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Find the video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Ensure the video belongs to the user
  if (video.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  // Toggle publish status
  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video ${video.isPublished ? "published" : "unpublished"} successfully`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
