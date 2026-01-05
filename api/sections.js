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

function normalizeSectionSortOrders(data) {
  data.sections.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
  data.sections.forEach((s, idx) => {
    s.sortOrder = idx + 1
  })
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const section = req.body
    if (!section.id || !section.name) {
      return res.status(400).json({ error: 'Missing required fields: id, name' })
    }

    const data = readData()
    const existingIndex = data.sections.findIndex(s => s.id === section.id)
    if (existingIndex >= 0) {
      return res.status(400).json({ error: 'Section with this id already exists' })
    }

    const newSortOrder = Number(section.sortOrder) || (data.sections.length + 1)

    // Shift sections with sortOrder >= newSortOrder
    data.sections.forEach((s) => {
      if (Number(s.sortOrder) >= newSortOrder) {
        s.sortOrder = Number(s.sortOrder) + 1
      }
    })

    data.sections.push({
      ...section,
      sortOrder: Number(newSortOrder),
      categories: section.categories || []
    })
    writeData(data)
    res.status(200).json(section)
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
