import 'dotenv/config';
import { createConnection } from "mysql2/promise";

const config = {
    host:process.env.DB_HOST,
    user:"root",
    password:process.env.DB_PASSWORD,
    database:"minidocs",
}

const connectToDatabase = async () =>{
    return await createConnection(config);
} 

export {connectToDatabase as createConnection, config};