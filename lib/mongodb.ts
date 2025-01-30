import { MongoClient, Db } from "mongodb";

if (!process.env.MONGO_URI) {
  throw new Error("Missing MONGO_URI in .env file");
}

const MONGO_URI = process.env.MONGO_URI;
const options = {};

// Create a global variable to store the connection
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // Use a global variable in development to avoid multiple connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGO_URI, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client every time
  client = new MongoClient(MONGO_URI, options);
  clientPromise = client.connect();
}

// Export the MongoDB connection
export default async function connectToDB(): Promise<Db> {
  const client = await clientPromise;
  return client.db(); // Connect to the default database
}
