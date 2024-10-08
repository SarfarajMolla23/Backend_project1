import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const { channelId } = req.params;

  // Validate channelId
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Fetch total videos uploaded by the channel
  const totalVideos = await Video.countDocuments({ channel: channelId });

  // Fetch total subscribers for the channel
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  // Fetch total likes for all videos by this channel
  const totalLikes = await Like.countDocuments({ channel: channelId });

  // Fetch total views for all videos by this channel
  const totalViews = await Video.aggregate([
    {
      $match: {
        channel: mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
      },
    },
  ]);

  const totalViewsCount = totalViews.length > 0 ? totalViews[0].totalViews : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalViews: totalViewsCount,
      },
      "Channel stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate channelId
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Pagination logic
  const skip = (page - 1) * limit;

  // Fetch videos uploaded by the channel
  const videos = await Video.find({ channel: channelId })
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 }); // Sort by latest uploaded

  // Get total number of videos for the channel (for pagination)
  const totalVideos = await Video.countDocuments({ channel: channelId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        totalVideos,
        currentPage: page,
        totalpages: Math.ceil(totalVideos / limit),
      },
      "Videos fetched successfully"
    )
  );
});

export { getChannelStats, getChannelVideos };
