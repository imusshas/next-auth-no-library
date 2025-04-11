import { MongoClient } from "mongodb";
import { config } from "dotenv";
config();

// async function createTTLIndex() {
//   try {
//     const client = await MongoClient.connect(process.env.DATABASE_URL);
//     const db = client.db();
//     const result = await db.collection("Session").createIndex(
//       { expires: 1 },  // Index on the `expires` field
//       { expireAfterSeconds: 0 }  // TTL index with immediate expiration
//     );
//     console.log("TTL index created:", result);
//     await client.close();
//   } catch (error) {
//     console.log(error);
//   }
// }

// createTTLIndex().then();

async function getIndexes() {
  try {
    const client = await MongoClient.connect(process.env.DATABASE_URL);
    const db = client.db();
    const indexes = await db.collection("Session").listIndexes().toArray();
    console.log(indexes)
    await client.close();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

getIndexes().then();