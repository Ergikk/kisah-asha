import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Multer storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'public', 'images')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname)
    cb(null, uniqueName)
  },
})
const upload = multer({ storage })

export default function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(500).json({ error: 'Upload failed' })
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
      res.status(200).json({ image: `/images/${req.file.filename}` })
    })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
