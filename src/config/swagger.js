// src/config/swagger.js
const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'CatálogoBulk API',
        version: '1.0.0',
        description: 'Sistema de importación masiva de catálogos de productos'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Desarrollo'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            Usuario: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'ObjectId' },
                    email: { type: 'string', format: 'email' },
                    rol: { type: 'string', enum: ['admin', 'user'] }
                }
            },
            Producto: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    sku: { type: 'string' },
                    nombre: { type: 'string' },
                    precio: { type: 'number', minimum: 0 },
                    stock: { type: 'integer', minimum: 0 },
                    categoria: { type: 'string' },
                    descripcion: { type: 'string', nullable: true },
                    imagenUrl: { type: 'string', nullable: true },
                    proveedorId: { type: 'string' },
                    disponible: { type: 'boolean' }
                },
                required: ['sku', 'nombre', 'precio', 'stock', 'categoria', 'proveedorId']
            },
            Proveedor: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    nombre: { type: 'string' },
                    slug: { type: 'string' },
                    contactoEmail: { type: 'string', nullable: true },
                    logoUrl: { type: 'string', nullable: true },
                    activo: { type: 'boolean' }
                },
                required: ['nombre', 'slug']
            },
            Categoria: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    slug: { type: 'string' },
                    nombre: { type: 'string' },
                    descripcion: { type: 'string', nullable: true },
                    imagenUrl: { type: 'string', nullable: true }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    codigo: { type: 'string' }
                }
            }
        }
    },
    paths: {
        '/health': {
            get: {
                summary: 'Health check',
                tags: ['System'],
                responses: {
                    '200': {
                        description: 'Sistema operacional',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string' },
                                        mongo: { type: 'string' },
                                        redis: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '503': {
                        description: 'BD no disponible'
                    }
                }
            }
        },
        '/api/auth/register': {
            post: {
                summary: 'Registrar nuevo usuario',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' },
                                    rol: { type: 'string', enum: ['admin', 'user'] }
                                },
                                required: ['email', 'password']
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Usuario creado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Usuario' }
                            }
                        }
                    },
                    '409': {
                        description: 'Email duplicado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' }
                            }
                        }
                    }
                }
            }
        },
        '/api/auth/login': {
            post: {
                summary: 'Iniciar sesión',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' }
                                },
                                required: ['email', 'password']
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Login exitoso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '401': {
                        description: 'Credenciales inválidas',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' }
                            }
                        }
                    }
                }
            }
        },
        '/api/productos': {
            get: {
                summary: 'Listar productos',
                tags: ['Productos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
                    { name: 'categoria', in: 'query', schema: { type: 'string' } },
                    { name: 'proveedor', in: 'query', schema: { type: 'string' } },
                    { name: 'disponible', in: 'query', schema: { type: 'boolean' } }
                ],
                responses: {
                    '200': {
                        description: 'Lista de productos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Producto' } },
                                        page: { type: 'integer' },
                                        limit: { type: 'integer' },
                                        total: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'No autorizado' }
                }
            },
            post: {
                summary: 'Crear producto',
                tags: ['Productos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Producto' }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Producto creado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Producto' }
                            }
                        }
                    },
                    '403': { description: 'Solo admin' },
                    '409': { description: 'SKU duplicado' }
                }
            }
        },
        '/api/productos/stats': {
            get: {
                summary: 'Estadísticas de productos',
                tags: ['Productos'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Estadísticas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        totalProductos: { type: 'integer' },
                                        precioPromedio: { type: 'number' },
                                        porCategoria: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    categoria: { type: 'string' },
                                                    count: { type: 'integer' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/productos/{id}': {
            get: {
                summary: 'Obtener producto',
                tags: ['Productos'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': {
                        description: 'Producto encontrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Producto' }
                            }
                        }
                    },
                    '404': { description: 'No encontrado' }
                }
            },
            put: {
                summary: 'Actualizar producto',
                tags: ['Productos'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Producto' }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Actualizado' },
                    '403': { description: 'Solo admin' },
                    '404': { description: 'No encontrado' }
                }
            },
            delete: {
                summary: 'Eliminar producto',
                tags: ['Productos'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '204': { description: 'Eliminado' },
                    '403': { description: 'Solo admin' },
                    '404': { description: 'No encontrado' }
                }
            }
        },
        '/api/proveedores': {
            get: {
                summary: 'Listar proveedores',
                tags: ['Proveedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer' } },
                    { name: 'activo', in: 'query', schema: { type: 'boolean' } }
                ],
                responses: {
                    '200': {
                        description: 'Lista de proveedores',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Proveedor' } },
                                        total: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Crear proveedor',
                tags: ['Proveedores'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Proveedor' }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Proveedor creado' },
                    '403': { description: 'Solo admin' },
                    '409': { description: 'Duplicado' }
                }
            }
        },
        '/api/proveedores/{id}': {
            get: {
                summary: 'Obtener proveedor',
                tags: ['Proveedores'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Proveedor encontrado' },
                    '404': { description: 'No encontrado' }
                }
            },
            put: {
                summary: 'Actualizar proveedor',
                tags: ['Proveedores'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Proveedor' }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Actualizado' },
                    '403': { description: 'Solo admin' }
                }
            },
            delete: {
                summary: 'Eliminar proveedor',
                tags: ['Proveedores'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '204': { description: 'Eliminado' },
                    '403': { description: 'Solo admin' },
                    '409': { description: 'Tiene productos asociados' }
                }
            }
        },
        '/api/categorias': {
            get: {
                summary: 'Listar categorías',
                tags: ['Categorías'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de categorías',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Categoria' }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/categorias/{slug}': {
            get: {
                summary: 'Obtener categoría por slug',
                tags: ['Categorías'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Categoría encontrada' },
                    '404': { description: 'No encontrada' }
                }
            }
        },
        '/api/categorias/{id}': {
            put: {
                summary: 'Actualizar categoría',
                tags: ['Categorías'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' },
                                    descripcion: { type: 'string' },
                                    imagenUrl: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Actualizado' },
                    '403': { description: 'Solo admin' }
                }
            }
        }
    }
};

export default swaggerSpec;
