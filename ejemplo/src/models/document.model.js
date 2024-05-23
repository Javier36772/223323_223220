import {createConnection} from '../configs/db.config.js';

class Document{
    constructor({id, title, content, createdBy, createdAt, updatedAt, updatedBy, deleted, deletedAt, deletedBy}){
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.updatedBy = updatedBy;
        this.deleted = deleted;
        this.deletedAt = deletedAt;
        this.deletedBy = deletedBy;
    }

    static async findAll(limit, offset){
        const connection = await createConnection();

        let query = "SELECT id, title, content, createdBy, createdAt, updatedAt, updatedBy, deleted, deletedAt, deletedBy FROM documents WHERE deleted = 0";

        if (offset >= 0 && limit) {
            query += ` LIMIT ${offset}, ${limit}`;
        }
        const [documents] = await connection.query(query);
        connection.end();
        return documents;
    }

    static async findById(id){
        const connection = await createConnection();
        const [documents] = await connection.query(`SELECT id, title, content, createdBy, createdAt, updatedAt, updatedBy, deleted, deletedAt, deletedBy FROM documents WHERE id = ${id} AND deleted = 0`);
        connection.end();
        return documents[0];
    }
    
    static async findByUserId(userId){
        const connection = await createConnection();
        const [documents] = await connection.query(`SELECT d.id, d.title, d.content, d.createdBy, u.username, d.createdAt, d.updatedAt, d.updatedBy, d.deleted, d.deletedAt, d.deletedBy FROM documents d INNER JOIN permissions p ON d.id = p.documentId INNER JOIN users u ON d.createdBy = u.id WHERE d.deleted = 0 AND p.userId = ? ORDER BY updatedAt DESC`, [userId]);
        connection.end();
        return documents;
    }


    async create(){
        const connection = await createConnection();
        const createdDate = new Date();
        const [document] = await connection.query(`INSERT INTO documents (title, createdBy, createdAt) VALUES (?, ?, ?)`, [this.title, this.createdBy, createdDate]);
        const [permission] = await connection.query(`INSERT INTO permissions (documentId, userId) VALUES (?, ?)`, [document.insertId, this.createdBy]);
        connection.end();
        
        this.id = document.insertId;
        return document;
    }

    static async addPermissions(documentId, userId){
        const connection = await createConnection();
        const [permission] = await connection.query(`INSERT INTO permissions (documentId, userId) VALUES (?, ?)`, [documentId, userId]);
        connection.end();
        return permission;
    }

    static async inviteUser (documentId, invitedBy, invitedId){
        const connection = await createConnection();
        const [invitation] = await connection.query(`INSERT INTO notifications (documentId, invitedId, ownerId) VALUES (?, ?, ?)`, [documentId, invitedId, invitedBy]);
        connection.end();
        return invitation;
    }

    static async getNotifications(userId){
        const connection = await createConnection();
        // const [notifications] = await connection.query(`SELECT n.id, d.title, n.documentId, n.ownerId, n.invitedId from documents d INNER JOIN notifications n ON d.id = n.documentId WHERE n.invitedId = ? AND n.nStatus = 'pending'`, [userId]);
        const [notifications] = await connection.query(`SELECT n.id, u.username, d.title, n.documentId, n.ownerId, n.invitedId from documents d INNER JOIN notifications n ON d.id = n.documentId LEFT JOIN users u ON n.ownerId = u.id WHERE n.invitedId = ? AND n.nStatus = 'pending'`, [userId]);
        connection.end();
        return notifications;
    }

    static async responseNotification(notificationId, response){
        let query;
        if(response === "accept"){
            query = `UPDATE notifications SET nStatus = 'accepted' WHERE id = ?`;
        }else{
            query = `UPDATE notifications SET nStatus = 'rejected' WHERE id = ?`;
        }

        const connection = await createConnection();
        const [permission] = await connection.query(query, [notificationId]);
        connection.end();

        return permission;
    }

    static async delete(id, deletedBy){
        const connection = await createConnection();
        const deletedDate = new Date();
        const [document] = await connection.query(`UPDATE documents SET deleted = 1, deletedAt = ?, deletedBy = ? WHERE id = ?`, [deletedDate, deletedBy, id]);
        connection.end();
        return document;
    }

    static async update(document, id){
        const connection = await createConnection();
        const [updatedDocument] = await connection.query(`UPDATE documents SET ? WHERE id = ?`, [document, id]);
        connection.end();
        return updatedDocument;
    }

    static async rename(payload, id, updatedBy){
        const connection = await createConnection();
        const [updatedDocument] = await connection.query(`UPDATE documents SET title = ?, updatedBy = ? WHERE id = ?`, [payload.title, updatedBy, id]);
        connection.end();
        return updatedDocument;
    }

    static async getContent(id){
        const connection = await createConnection();
        const [document] = await connection.query(`SELECT title, content FROM documents WHERE id = ?`, [id]);
        connection.end();
        return document[0];
    }

    static async setContent(payload, id, updatedBy){
        const updatedDate = new Date();
        const connection = await createConnection();
        const [updatedDocument] = await connection.query(`UPDATE documents SET content = ?, updatedBy = ?, updatedAt = ? WHERE id = ?`, [payload.content, updatedBy, updatedDate, id]);
        connection.end();
        return updatedDocument;
    }
}

export default Document;