import { type Db, MongoClient, type Collection } from "mongodb";
import { config } from "../config";

let dbConnection: Db;

export async function getConnection(): Promise<Db> {
  if (dbConnection) return dbConnection;
  const client = new MongoClient(config.db.url, {
    auth: {
      username: config.db.username,
      password: config.db.password,
    },
  });
  await client.connect();
  const db = client.db(config.db.database);
  dbConnection = db;
  return db;
}

export async function getCollection(name: string): Promise<Collection> {
  if (!dbConnection) {
    await getConnection();
  }
  return dbConnection.collection(name);
}
