const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const uploadRequestImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `request_${Date.now()}.${fileExtension}`;
    const key = `request_images/${fileName}`;

    const uploadParams = {
      Bucket: 'barangay-images',
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Construct the URL manually since we're not using public access
    const imageUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      s3Key: key
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

module.exports = { uploadRequestImage }; // Use module.exports for CommonJS