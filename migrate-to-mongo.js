import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MongoClient } from 'mongodb'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Missing MONGODB_URI environment variable')
    process.exit(1)
  }
  const dbName = process.env.MONGODB_DB || 'kisah-asha'

  const candidates = [
    path.join(__dirname, 'backend', 'data', 'menu.json'),
    path.join(__dirname, 'data', 'menu.json')
  ]

  const sourcePath = candidates.find((p) => fs.existsSync(p))
  if (!sourcePath) {
    console.error('No source menu.json found in backend/data or data/')
    process.exit(1)
  }

  console.log(`Reading data from: ${sourcePath}`)
  const raw = fs.readFileSync(sourcePath, 'utf8')
  const parsed = JSON.parse(raw)
  const sections = Array.isArray(parsed.sections) ? parsed.sections : []

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    await db.collection('menu').updateOne(
      { _id: 'menu' },
      { $set: { sections } },
      { upsert: true }
    )
    console.log(`Migration complete. Sections: ${sections.length}`)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

run()


