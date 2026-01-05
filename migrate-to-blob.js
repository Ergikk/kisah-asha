import fs from 'fs'
import path from 'path'
import { put } from '@vercel/blob'

const DATA_PATH = path.join(process.cwd(), 'data', 'menu.json')

async function migrateData() {
  try {
    // Read existing data
    if (!fs.existsSync(DATA_PATH)) {
      console.log('No existing data found to migrate')
      return
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

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateData()
