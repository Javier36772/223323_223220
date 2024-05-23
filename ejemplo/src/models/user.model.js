import {createConnection} from '../configs/db.config.js';

class User{
    constructor({id, username, email, password}){
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    static async findAll(limit, offset){
        const connection = await createConnection();

        let query = "SELECT id, username, email, password FROM users";

        if (offset >= 0 && limit) {
            query += ` LIMIT ${offset}, ${limit}`;
        }
        const [users] = await connection.query(query);
        connection.end();
        return users;
    }

    static async getById(id){
        const connection = await createConnection();
        const [users] = await connection.query("SELECT id, username, email, password FROM users WHERE id = ?", [id]);
        connection.end();
        return users[0];
    }

    static async getByEmail(email){
        const connection = await createConnection();
        const [users] = await connection.query("SELECT id, username, email, password FROM users WHERE email = ?", [email]);
        connection.end();

        return users[0];
    }

    async create(){
        const connection = await createConnection();
        const [user] = await connection.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [this.username, this.email, this.password]);
        connection.end();

        if(user.insertId === 0 || user.affectedRows === 0){
            throw new Error("No se insertó el usuario de forma correcta");
        }

        this.id = user.insertId;
    }
}

export default User;