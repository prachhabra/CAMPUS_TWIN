// @desc    Handle file upload
// @route   POST /api/uploads
// @access  Private
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded or file format not supported'
    });
  }

  // Construct relative URL for the uploaded file
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
};

module.exports = { uploadFile };
