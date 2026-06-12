/*const { imageHash } = require("image-hash");
const https = require("https");
const fs = require("fs");
const path = require("path");

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve(dest));
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

function generateImageHash(filePath) {
  return new Promise((resolve, reject) => {
    imageHash(filePath, 16, true, (error, data) => {
      if (error) return reject(error);
      resolve(data);
    });
  });
}

function hammingDistance(str1, str2) {
  let dist = 0;
  for (let i = 0; i < str1.length; i++) {
    dist += str1[i] !== str2[i];
  }
  return dist;
}

module.exports = {
  downloadImage,
  generateImageHash,
  hammingDistance,
};*/
