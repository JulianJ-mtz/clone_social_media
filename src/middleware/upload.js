import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'), false)
    }
  }
})

export const uploadToS3 = (fieldName, required = true) => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName)

    uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message })
      }

      if (required && !req.file) {
        return res.status(400).json({ error: 'File is required' })
      }

      next()
    })
  }
}
