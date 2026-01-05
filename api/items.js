import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_PATH = path.join(__dirname, '..', 'data', 'menu.json')

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

function readData() {
  if (!fs.existsSync(DATA_PATH)) {
    const defaultData = { sections: [] }
    fs.writeFileSync(DATA_PATH, JSON.stringify(defaultData, null, 2))
    return defaultData
  }
  const raw = fs.readFileSync(DATA_PATH, 'utf8')
  return JSON.parse(raw)
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
}

function normalizeSectionSortOrders(data) {
  data.sections.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
  data.sections.forEach((s, idx) => {
    s.sortOrder = idx + 1
  })
}

function normalizeItemSortOrders(category) {
  category.items.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
  category.items.forEach((item, idx) => {
    item.sortOrder = idx + 1
  })
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Handle POST /api/items
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(500).json({ error: 'Upload failed' })

      let { sectionId, categoryId, item: itemData } = req.body
      if (!sectionId || !categoryId || !itemData) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      let item
      try {
        if (typeof itemData === 'string') item = JSON.parse(itemData)
        else item = itemData
      } catch (e) {
        return res.status(400).json({
          error: 'Invalid item format (expected JSON string or object)',
          receivedType: typeof itemData,
        })
      }

      if (req.file) item.image = `/images/${req.file.filename}`

      const data = readData()

      let section = data.sections.find((s) => s.id === sectionId)
      if (!section) {
        section = { id: sectionId, name: sectionId, categories: [] }
        data.sections.push(section)
      }

      let category = section.categories.find((c) => c.id === categoryId)
      if (!category) {
        category = {
          id: categoryId,
          name: categoryId
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          items: [],
        }
        section.categories.push(category)
      }

      const index = category.items.findIndex((i) => i.id === item.id)
      if (index >= 0) {
        // Editing existing item
        const existingItem = category.items[index]
        const oldSortOrder = Number(existingItem.sortOrder) || 1
        const newSortOrder = Number(item.sortOrder) || oldSortOrder

        // Shift other items based on the move direction
        if (newSortOrder !== oldSortOrder) {
          if (newSortOrder < oldSortOrder) {
            // Moving up: shift items between newSortOrder and oldSortOrder-1 up by 1
            category.items.forEach((i, idx) => {
              if (idx !== index && Number(i.sortOrder) >= newSortOrder && Number(i.sortOrder) < oldSortOrder) {
                i.sortOrder = Number(i.sortOrder) + 1
              }
            })
          } else if (newSortOrder > oldSortOrder) {
            // Moving down: shift items between oldSortOrder+1 and newSortOrder down by 1
            category.items.forEach((i, idx) => {
              if (idx !== index && Number(i.sortOrder) > oldSortOrder && Number(i.sortOrder) <= newSortOrder) {
                i.sortOrder = Number(i.sortOrder) - 1
              }
            })
          }
        }

        item.sortOrder = newSortOrder
        category.items[index] = item
      } else {
        // Adding new item
        const newSortOrder = item.sortOrder || 1

        // Shift items with sortOrder >= newSortOrder
        category.items.forEach((i) => {
          if (i.sortOrder >= newSortOrder) {
            i.sortOrder += 1
          }
        })

        item.sortOrder = newSortOrder
        category.items.push(item)
      }

      writeData(data)
      res.status(200).json(item)
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
