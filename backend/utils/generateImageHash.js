const { imageHash } = require("image-hash");
const https = require("https");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const crypto = require("crypto");

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "temp.jpg");
    const file = fs.createWriteStream(filePath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve(filePath));
        });
      })
      .on("error", (err) => reject(err));
  });
}

function getImageHash(filePath) {
  return new Promise((resolve, reject) => {
    imageHash(filePath, 16, true, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

module.exports = async function generateImageHash(url) {
  try {
    console.log("Fetching image from:", url);
    const response = await axios.get(url, { responseType: "arraybuffer" });

    if (!response.data || response.status !== 200) {
      throw new Error("Failed to fetch image from Cloudinary");
    }

    const buffer = Buffer.from(response.data);
    console.log("Buffer size:", buffer.length);

    // Resize and convert to raw pixel data
    const { data: rawBuffer } = await sharp(buffer)
      .resize(64, 64)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const hash = crypto.createHash("sha256").update(rawBuffer).digest("hex");

    console.log("Generated image hash:", hash);
    return hash;
  } catch (err) {
    console.error("Image hash generation failed:", err.message);
    throw new Error("Could not process image. Please try a different file.");
  }
};
