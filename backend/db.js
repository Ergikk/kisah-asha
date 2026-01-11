import { MongoClient } from 'mongodb'

let cachedClient = null
let cachedDb = null

export async function getDb() {
  if (cachedDb) return cachedDb

  const uri = 'mongodb+srv://lrisdhi7_db_user:haB5EWEwPqNK91bx@cluster0.fu4xbhh.mongodb.net/'
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable')
  }

  const dbName = process.env.MONGODB_DB || 'asha-menu'

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5
    })
  }
  const client = await cachedClient.connect()
  cachedDb = client.db(dbName)
  return cachedDb
}

export async function getMenuData() {
  const db = await getDb()
  const doc = await db.collection('menu').findOne({ _id: '6962a502da01e50da076febf' })
  console.log(doc.sections)
  if (!doc) {
    return { sections: [] }
  }
  // Ensure consistent shape
  return { sections: Array.isArray(doc.sections) ? doc.sections : [] }
}

export async function writeMenuData(data) {
  const db = await getDb()
  const sections = Array.isArray(data?.sections) ? data.sections : []
  await db.collection('menu').updateOne(
    { _id: '6962a502da01e50da076febf' },
    { $set: { sections } },
    { upsert: true }
  )
}
