import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const secretJWT = process.env.SECRET_JWT;
import { createUser } from './users.controller.js';
import User from '../models/user.model.js';

const { sign } = jwt;

export const login = async (req, res) => {
    const { email, password } = req.body;
    const userFound = await User.getByEmail(email);

    console.log(secretJWT)
    console.log(email)

    if (!userFound) {
        return res.status(401).json({
            message: "email o contraseña incorrecta"
        });
    }

    const isCorrectPass = bcrypt.compareSync(password, userFound.password)

    if (!isCorrectPass) {
        return res.status(401).json({
            message: "email o contraseña incorrecta"
        });
    }

    const payload = {
        user: {
            id: userFound.id
        }
    }

    const token = sign(payload, secretJWT, { expiresIn: '5h' });

    // localStorage.setItem('token', JSON.stringify(token));

    return res.status(200).json({
        message: "acceso concedido",
        token: token
    });
}

export const signUp = async(req, res) => {
    // const { email, password, username,  } = req.body;
    const email = req.body.email;

    const userFound = await User.getByEmail(email);

    if (userFound) {
        return res.status(500).json({
            message: "Error, usuario ya existente, iniciar sesión"
        });
    }

    const user = await createUser(req, res);

    return res.status(201).json({
        success: true,
        data:user,
        message: "se registró el usuario correctamente"
    });

    //aquí no se generará token, una vez registrado, el usuario será enviado
    //a la ventana de inicio de sesión, en donde ingresará sus datos, y allí
    //se generará su token
}