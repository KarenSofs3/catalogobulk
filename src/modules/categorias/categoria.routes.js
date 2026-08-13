// src/modules/categorias/categoria.routes.js
import { Router } from 'express';
import { obtenerCategorias, actualizarCategoria } from './categoria.controller.js';
import { protegerRuta } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

// GET /api/categorias -> Autenticado (cualquier rol)
router.get('/', protegerRuta, obtenerCategorias);

// 🚨 CONTRATO LITERAL: Se consulta por SLUG, no por ID
// GET /api/categorias/:slug -> Autenticado
// Nota: Deberás ajustar tu controlador para que busque por req.params.slug
router.get('/:slug', protegerRuta, (req, res) => { /* lógica por slug */ });

// 🚨 CONTRATO LITERAL: Solo PUT para enriquecerlas por ID
// PUT /api/categorias/:id -> Solo Admin
router.put('/:id', protegerRuta, rol('admin'), actualizarCategoria);

export default router; 