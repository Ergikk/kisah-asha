import fs from 'fs'
import path from 'path'
import { put } from '@vercel/blob'

const DATA_PATH = path.join(process.cwd(), 'data', 'menu.json')

export default async function handler(req, res) {
  if (req.method === 'GET' || req.method === 'POST') {
    try {
      // Read existing data
      if (!fs.existsSync(DATA_PATH)) {
        return res.status(404).json({ error: 'No menu data found to migrate' })
      }

      const raw = fs.readFileSync(DATA_PATH, 'utf8')
      const data = JSON.parse(raw)

      console.log('Migrating menu data to Vercel Blob...')

      // Upload to Vercel Blob
      const blob = await put('menu-data.json', JSON.stringify(data, null, 2), {
        access: 'public',
        contentType: 'application/json'
      })

      console.log('Migration successful!')
      console.log('Blob URL:', blob.url)

      res.status(200).json({
        success: true,
        message: 'Migration completed successfully',
        blobUrl: blob.url,
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
        error: 'Migration failed',
        details: error.message
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
