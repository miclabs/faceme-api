const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");

class ImageService {
  async cacheImage(url, imageId, deviceId) {
    const folder = path.join(__dirname, "..", "..", "public", "faceme", deviceId);

    await fs.mkdir(folder, { recursive: true });

    const extension = path.extname(url) || ".jpg";
    const filename = `${imageId}${extension}`;
    const filePath = path.join(folder, filename);

    // Already downloaded
    // try {
    //   await fs.access(filePath);
    //   return `${process.env.BASE_URL}/faceme/${deviceId}/${filename}`;
    // } catch (_) {}

    const response = await axios.get(url, {
      responseType: "arraybuffer"
    });

    await fs.writeFile(filePath, response.data);

    return `${process.env.BASE_URL}/faceme/${deviceId}/${filename}`;
  }
}

module.exports = new ImageService();