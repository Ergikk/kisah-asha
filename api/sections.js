import { kv } from '@vercel/kv'
import fs from 'fs'
import path from 'path'

const MENU_KEY = 'menu-data'
const DATA_PATH = path.join(process.cwd(), 'backend', 'data', 'menu.json')

async function readData() {
  try {
    let data = await kv.get(MENU_KEY)
    if (!data) {
      // Initialize KV with file data if KV is empty
      if (fs.existsSync(DATA_PATH)) {
        const raw = fs.readFileSync(DATA_PATH, 'utf8')
        data = JSON.parse(raw)
        await kv.set(MENU_KEY, data)
        console.log('Initialized KV with file data')
      } else {
        data = { sections: [] }
      }
    }
    return data
  } catch (error) {
    console.error('Error reading data:', error)
    return { sections: [] }
  }
}

async function writeData(data) {
  try {
    await kv.set(MENU_KEY, data)
  } catch (error) {
    console.error('Error writing data:', error)
    throw error
  }
}

function normalizeSectionSortOrders(data) {
  data.sections.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
  data.sections.forEach((s, idx) => {
    s.sortOrder = idx + 1
  })
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const section = req.body
      if (!section.id || !section.name) {
        return res.status(400).json({ error: 'Missing required fields: id, name' })
      }

      const data = await readData()
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
      await writeData(data)
      res.status(200).json(section)
    } catch (error) {
      console.error('Error in POST /api/sections:', error)
      res.status(500).json({ error: 'Failed to create section' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
