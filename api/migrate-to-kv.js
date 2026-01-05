import fs from 'fs'
import path from 'path'
import { kv } from '@vercel/kv'

const MENU_KEY = 'menu-data'
const DATA_PATH = path.join(process.cwd(), 'backend', 'data', 'menu.json')

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Read existing data from file
      if (!fs.existsSync(DATA_PATH)) {
        return res.status(404).json({ error: 'No menu data found to migrate' })
      }

      const raw = fs.readFileSync(DATA_PATH, 'utf8')
      const data = JSON.parse(raw)

      console.log('Migrating menu data to Vercel KV...')

      // Write to KV
      await kv.set(MENU_KEY, data)

      console.log('Migration successful!')

      res.status(200).json({
        success: true,
        message: 'Migration to KV completed successfully',
        migratedSections: data.sections?.length || 0,
        migratedItems: data.sections?.reduce((total, section) =>
          total + section.categories?.reduce((catTotal, category) =>
            catTotal + (category.items?.length || 0), 0
          ) || 0, 0
        ) || 0
      })

    } catch (error) {
      console.error('Migration failed:', error)
      res.status(500).json({
        error: 'Migration to KV failed',
        details: error.message
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
