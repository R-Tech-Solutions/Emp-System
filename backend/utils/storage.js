const { storage } = require("../firebaseConfig");
const { v4: uuidv4 } = require("uuid");
const stream = require("stream");

// Helper to upload image to Firebase Storage
async function uploadImageToStorage(file) {
  if (!file) return "";
  const bucket = storage.bucket();
  const filename = `products/${uuidv4()}_${file.originalname}`;
  const fileRef = bucket.file(filename);
  const passthroughStream = new stream.PassThrough();
  passthroughStream.end(file.buffer);
  await new Promise((resolve, reject) => {
    passthroughStream.pipe(fileRef.createWriteStream({
      metadata: { contentType: file.mimetype },
    }))
    .on("finish", resolve)
    .on("error", reject);
  });
  await fileRef.makePublic();
  return fileRef.publicUrl();
}

// Helper to delete image from Firebase Storage by URL
async function deleteImageFromStorage(imageUrl) {
  if (!imageUrl) return;
  try {
    // Extract the file path after the bucket domain
    const match = imageUrl.match(/\/products\/[^?]+/);
    if (!match) return;
    const filePath = match[0].replace(/^\//, "");
    const bucket = storage.bucket();
    const fileRef = bucket.file(filePath);
    await fileRef.delete();
  } catch (err) {
    // Log but do not throw, so product update/delete can continue
    console.error("Error deleting image from storage:", err.message);
  }
}

module.exports = {
  uploadImageToStorage,
  deleteImageFromStorage
}; 