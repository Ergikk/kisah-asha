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
  const { sectionId } = req.query

  if (req.method === 'PUT') {
    try {
      const updates = req.body

      const data = await readData()
      const sectionIndex = data.sections.findIndex(s => s.id === sectionId)
      if (sectionIndex === -1) {
        return res.status(404).json({ error: 'Section not found' })
      }

      const currentSection = data.sections[sectionIndex]
      const oldPos = Number(currentSection.sortOrder)
      const newPos = Number(updates.sortOrder)

      // Shift other sections based on the move direction
      if (!isNaN(newPos) && newPos !== oldPos) {
        if (newPos < oldPos) {
          // Moving up: shift sections between newPos and oldPos-1 up by 1
          data.sections.forEach((s, idx) => {
            if (idx !== sectionIndex && Number(s.sortOrder) >= newPos && Number(s.sortOrder) < oldPos) {
              s.sortOrder = Number(s.sortOrder) + 1
            }
          })
        } else if (newPos > oldPos) {
          // Moving down: shift sections between oldPos+1 and newPos down by 1
          data.sections.forEach((s, idx) => {
            if (idx !== sectionIndex && Number(s.sortOrder) > oldPos && Number(s.sortOrder) <= newPos) {
              s.sortOrder = Number(s.sortOrder) - 1
            }
          })
        }
      }

      // Ensure sortOrder is stored as a number
      const updatedSection = { ...data.sections[sectionIndex], ...updates }
      if (updatedSection.sortOrder !== undefined) {
        updatedSection.sortOrder = Number(updatedSection.sortOrder)
      }
      data.sections[sectionIndex] = updatedSection

      // Normalize sortOrders to ensure they are sequential and unique
      normalizeSectionSortOrders(data)

      await writeData(data)
      res.status(200).json(data.sections[sectionIndex])
    } catch (error) {
      console.error('Error in PUT /api/sections/[sectionId]:', error)
      res.status(500).json({ error: 'Failed to update section' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const data = await readData()
      const sectionIndex = data.sections.findIndex(s => s.id === sectionId)
      if (sectionIndex === -1) {
        return res.status(404).json({ error: 'Section not found' })
      }

      data.sections.splice(sectionIndex, 1)
      normalizeSectionSortOrders(data)
      await writeData(data)
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error in DELETE /api/sections/[sectionId]:', error)
      res.status(500).json({ error: 'Failed to delete section' })
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
