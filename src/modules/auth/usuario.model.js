// src/modules/auth/usuario.model.js
import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const usuarioSchema = new Schema({
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de correo inválido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        select: false // nunca se devuelve por defecto en las consultas
    },
    rol: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.password; // blindaje extra: nunca sale ni por accidente
            return ret;
        }
    }
});

// Middleware para encriptar contraseña antes de guardar
usuarioSchema.pre('save', async function () {
    // Si la contraseña no ha sido modificada, simplemente salimos de la función
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // ¡Ya no llamamos a next() aquí! Al ser una función async, Mongoose sabe cuándo termina cuando se resuelve la promesa.
    } catch (error) {
        throw error; // Lanzamos el error hacia arriba para que Mongoose lo capture
    }
});

// Método para comparar contraseñas
usuarioSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const Usuario = model('Usuario', usuarioSchema);