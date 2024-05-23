import Document from '../models/document.model.js';
import 'dotenv/config';
import User from '../models/user.model.js';
import DocumentDto from '../dtos/document.dto.js';

// LONG POLLING
let resClients = [];

const getDocumentsByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const documents = await Document.findByUserId(userId);

        return res.status(200).json({
            success: true,
            documents,
            message: "se obtuvieron los documentos correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "ocurrió un error al obtener los documentos",
            error: error.message
        });
    }
}

const refreshDocumentsByUser = async (req, res) => {
    try {
        resClients.push(res);

        req.on('close', () => {
            const index = resClients.indexOf(res);
            if (index !== -1) {
                resClients.splice(index, 1);
                res.end();
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "ocurrió un error al refrescar los documentos",
            error: error.message
        });
    }
}

const createDocument = async (req, res) => {
    try {
        const createdBy = req.user.id;
        const document = new Document({
            ...req.body,
            createdBy: createdBy
        });

        const createdDocument = await document.create(document);

        refreshClients(document, createdBy);

        return res.status(201).json({
            success: true,
            document,
            message: "se creó el documento correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "ocurrió un error al crear el documento",
            error: error.message
        });
    }
}

function refreshClients(document, userId) {
    
    resClients.map(res => {
        let filterId = res.socket.parser.incoming.user.id;
        if (userId === filterId) {
            res.status(200).json({
                success: true,
                document
            });
        }
    });

    resClients = [];
}

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const offset = (page - 1) * limit;

        const documents = await Document.findAll(limit, offset);

        return res.status(200).json({
            success: true,
            documents,
            message: "se obtuvieron los documentos correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "ocurrió un error al obtener los documentos",
            error: error.message
        });
    }
}

const show = async (req, res) => {
    try {
        const id = req.params.id;
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "no se encontró el documento"
            });
        }

        return res.status(200).json({
            success: true,
            document,
            message: "se obtuvo el documento correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "ocurrió un error al obtener el documento",
            error: error.message
        });
    }
}

const deleteDocument = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedBy = req.user.id;

        const document = await Document.delete(id, deletedBy);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "no se encontró el documento"
            });
        }

        return res.status(200).json({
            success: true,
            message: "se eliminó el documento correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "ocurrió un error al eliminar el documento",
            error: error.message
        });
    }
}

const updateDocument = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedBy = req.user.id;
        const document = new Document({
            ...req.body,
            updatedBy
        });

        const updatedDocument = await Document.update(document, id);

        if (!updatedDocument) {
            return res.status(404).json({
                success: false,
                message: "no se encontró el documento"
            });
        }

        return res.status(200).json({
            success: true,
            message: "se actualizó el documento correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "ocurrió un error al actualizar el documento",
            error: error.message
        });
    }
}


// const getDocumentsByUser = async (req, res) => {
//     try {
//         const userId = await req.user.id;

//         const documents = await Document.findByUserId(userId);

//         return res.status(200).json({
//             success: true,
//             documents,
//             message: "se obtuvieron los documentos correctamente"
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "ocurrió un error al obtener los documentos",
//             error: error.message
//         });
//     }
// }

// const refreshDocumentsByUser = async (req, res) => {
//     try {
//         const userId = await req.user.id;

//         const resClient = [];

//         resClient.push(res);

//         req.on('close', () => {
//             const index = resClient.length - 1;
//             resClient = resClient.slice(index, 1);
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "ocurrió un error al refrescar los documentos",
//             error: error.message
//         });
//     }
// }

const inviteDocumentNotification = async (req, res) => {
    try {
        const invitedBy = req.user.id;
        const { documentId, email } = req.body;

        const invitedUser = await User.getByEmail(email);

        if (!invitedUser) {
            return res.status(404).json({
                success: false,
                message: "no se encontró el usuario"
            });
        }

        const invitedUserId = invitedUser.id;

        const invitedDocument = await Document.inviteUser(documentId, invitedBy, invitedUserId);

        if (!invitedDocument) {
            return res.status(404).json({
                success: false,
                message: "no se encontró el documento"
            });
        }

        return res.status(200).json({
            success: true,
            message: "se invitó al usuario correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "ocurrió un error al invitar al usuario",
            error: error.message
        });
    }
}

const responseNotification = async (req, res) => {
    try {
        const { notificationId, response, documentId, invitedId } = req.body;

        const responseNotification = await Document.responseNotification(notificationId, response);

        if (!responseNotification) {
            return res.status(404).json({
                success: false,
                message: "no se encontró la notificación"
            });
        }

        if(response === "accept"){
            await Document.addPermissions(documentId, invitedId);

            return res.status(200).json({
                success: true,
                message: "se aceptó la notificación correctamente"
            });
        }

        return res.status(200).json({
            success: true,
            message: "se respondió la notificación correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "ocurrió un error al responder la notificación",
            error: error.message
        });
    }
}

const getNotifications = async(req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Document.getNotifications(userId);

        return res.status(200).json({
            success: true,
            notifications,
            message: "se obtuvieron las notificaciones correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "ocurrió un error al obtener las notificaciones",
            error: error.message
        });
    }
}

export {
    index,
    show,
    createDocument,
    deleteDocument,
    updateDocument, 
    inviteDocumentNotification,
    responseNotification,
    getDocumentsByUser,
    getNotifications,
    refreshDocumentsByUser
}