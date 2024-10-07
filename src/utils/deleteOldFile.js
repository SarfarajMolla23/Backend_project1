// Utility to extract public_id from Cloudinary URL
import {v2 as cloudinary} from "cloudinary"

const getCloudinaryPublicId = (url) => {
  // Assuming Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}

  const parts = url.split("/");

  const fileName = parts.pop(); // Extract the file name (e.g., 'avatar.jpg')

  const publicId = fileName.split(".")[0]; // Remove the extension to get public_id
  
  return publicId;
};

// Utility to delete avatar from Cloudinary

const deleteFromCloudinary = async (publicId) => {
  const cloudinary = await import("cloudinary").v2; // Make sure cloudinary is configured

  await cloudinary.uploader.destroy(publicId);
};

export { getCloudinaryPublicId, deleteFromCloudinary };
