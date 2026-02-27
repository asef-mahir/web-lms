import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const saveFileLocally = async (file) => {
  try {
    if (!file) {
      console.error('No file provided to saveFileLocally');
      return null;
    }

    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `video-${uniqueSuffix}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Move the file to the uploads directory
    await fs.promises.rename(file.path, filepath);

    // Return the relative URL
    return {
      secure_url: `/uploads/${filename}`,
      public_id: filename
    };
  } catch (error) {
    console.error('Error saving file locally:', error);
    return null;
  }
};

export { saveFileLocally };
