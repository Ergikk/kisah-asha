import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_PATH = path.join(__dirname, '..', '..', '..', '..', 'data', 'menu.json')

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

function normalizeItemSortOrders(category) {
  category.items.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
  category.items.forEach((item, idx) => {
    item.sortOrder = idx + 1
  })
}

export default function handler(req, res) {
  const { sectionId, categoryId, itemId } = req.query

  if (req.method === 'DELETE') {
    const data = readData()

    const section = data.sections.find((s) => s.id === sectionId)
    if (!section) return res.status(404).json({ error: 'Section not found' })

    const category = section.categories.find((c) => c.id === categoryId)
    if (!category) return res.status(404).json({ error: 'Category not found' })

    category.items = category.items.filter((i) => i.id !== itemId)
    normalizeItemSortOrders(category)
    writeData(data)
    res.status(200).json({ success: true })
  } else if (req.method === 'PATCH') {
    // Handle PATCH /api/items/:sectionId/:categoryId/:itemId/toggle
    const data = readData()
    const section = data.sections.find(s => s.id === sectionId)
    if (!section) {
      return res.status(404).json({ error: 'Section not found' })
    }

    const category = section.categories.find(c => c.id === categoryId)
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const item = category.items.find(i => i.id === itemId)
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }

    item.isAvailable = !item.isAvailable
    writeData(data)
    res.status(200).json(item)
  } else {
    res.setHeader('Allow', ['DELETE', 'PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
