import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  const userId = req.user._id;

  // Validate channelId
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Check if user is subscribing to themselves
  if (userId.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  // Check if the user is already subscribed to the channel
  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    subscribedTo: channelId,
  });

  if (existingSubscription) {
    // Unsubscribe if already subscribed
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed successfully"));
  }

  // Subscribe if not already subscribed
  const subscription = await Subscription.create({
    subscriber: userId,
    subscribedTo: channelId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subscription, "Subscribed successfully"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // Validate channelId
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Fetch all users subscribed to the channel
  const subscribers = await Subscription.find({
    subscribedTo: subscriberId,
  }).populate("subscriber", "name email");

  if (!subscribers.length) {
    throw new ApiError(404, "No subscribers found for this channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Validate subscriberId
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  // Fetch all channels the user has subscribed to
  const subscribedChannels = await Subscription.find({
    subscriber: channelId,
  }).populate("subscribedTo", "name email");

  if (!subscribedChannels.length) {
    throw new ApiError(404, "This user is not subscribed to any channels");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, 
    getUserChannelSubscribers, 
    getSubscribedChannels };
