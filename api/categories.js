import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_PATH = path.join(__dirname, '..', 'data', 'menu.json')

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

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Handle POST /api/sections/:sectionId/categories
    const { sectionId } = req.query
    const category = req.body
    if (!category.id || !category.name) {
      return res.status(400).json({ error: 'Missing required fields: id, name' })
    }

    const data = readData()
    const section = data.sections.find(s => s.id === sectionId)
    if (!section) {
      return res.status(404).json({ error: 'Section not found' })
    }

    const existingIndex = section.categories.findIndex(c => c.id === category.id)
    if (existingIndex >= 0) {
      return res.status(400).json({ error: 'Category with this id already exists in this section' })
    }

    section.categories.push({
      ...category,
      items: category.items || []
    })
    writeData(data)
    res.status(200).json(category)
  } else if (req.method === 'DELETE') {
    // Handle DELETE /api/sections/:sectionId/categories/:categoryId
    const { sectionId, categoryId } = req.query

    const data = readData()
    const section = data.sections.find(s => s.id === sectionId)
    if (!section) {
      return res.status(404).json({ error: 'Section not found' })
    }

    const categoryIndex = section.categories.findIndex(c => c.id === categoryId)
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' })
    }

    section.categories.splice(categoryIndex, 1)
    writeData(data)
    res.status(200).json({ success: true })
  } else {
    res.setHeader('Allow', ['POST', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
