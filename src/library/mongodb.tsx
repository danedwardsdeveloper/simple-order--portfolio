import { MongoClient } from 'mongodb'

import { isDevelopment } from '@/library/environment/publicVariables'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI missing')
}

const uri = process.env.MONGODB_URI

interface GlobalWithMongo extends Global {
  _mongoClientPromise?: Promise<MongoClient>
}

declare const global: GlobalWithMongo

let client: MongoClient
let mongoClient: Promise<MongoClient>

if (isDevelopment) {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  mongoClient = global._mongoClientPromise!
} else {
  client = new MongoClient(uri)
  mongoClient = client.connect()
}

export default mongoClient
