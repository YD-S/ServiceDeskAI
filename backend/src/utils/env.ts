import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config());

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    JWT_SECRET: process.env.JWT_SECRET,
    MONGO_USER: process.env.MONGO_INITDB_ROOT_USERNAME,
    MONGO_PASS: process.env.MONGO_INITDB_ROOT_PASSWORD,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    AI_ENDPOINT:
        process.env.AI_ENDPOINT,
};

export const MONGO_URI =
    process.env.MONGO_URI ||
    `mongodb://${env.MONGO_USER}:${env.MONGO_PASS}@mongo:27017/${env.MONGO_DB_NAME}?authSource=admin`;
