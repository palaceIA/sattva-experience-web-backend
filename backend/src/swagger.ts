const isProduction = process.env.NODE_ENV === 'production';
const authSecurityDefinition = isProduction
  ? {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  }
  : {};
const authMeSecurity = isProduction ? [{ bearerAuth: [] }] : undefined;

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Sattva Experience API',
    version: '1.0.0',
    description: 'Documentação Swagger para o backend de imersões e lotes da Sattva Experience.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local'
    }
  ],
  components: {
    securitySchemes: authSecurityDefinition,
    schemas: {
      AuthLogin: {
        type: 'object',
        required: ['name', 'password'],
        properties: {
          name: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'minhaSenha123' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'admin' },
          created_at: { type: 'string', format: 'date-time', example: '2026-05-30T12:00:00Z' }
        }
      },
      Immersion: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Imersão de Verão 2026' },
          description: { type: 'string', example: 'Uma semana intensiva de aprendizado' },
          data: { type: 'string', format: 'date', example: '2026-07-15' },
          local: { type: 'string', example: 'Guarujá, SP' },
          qtd_lote: { type: 'integer', example: 3 },
          image_path: { type: 'string', example: 'https://project.supabase.co/storage/v1/object/public/immersion-images/1/image.png' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      Lot: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          id_immersion: { type: 'integer', example: 1 },
          lote_number: { type: 'integer', example: 1 },
          valor: { type: 'number', format: 'float', example: 4500.0 },
          quantity_available: { type: 'integer', example: 50 },
          data_inicio: { type: 'string', format: 'date', example: '2026-06-01' },
          data_fim: { type: 'string', format: 'date', example: '2026-06-15' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      LotWithImmersion: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          id_immersion: { type: 'integer', example: 1 },
          immersion_name: { type: 'string', example: 'Imersão de Verão 2026' },
          lote_number: { type: 'integer', example: 1 },
          valor: { type: 'number', format: 'float', example: 4500.0 },
          quantity_available: { type: 'integer', example: 50 },
          data_inicio: { type: 'string', format: 'date', example: '2026-06-01' },
          data_fim: { type: 'string', format: 'date', example: '2026-06-15' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      ImmersionImageUploadResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Imagem enviada com sucesso' },
          data: {
            type: 'object',
            properties: {
              path: { type: 'string', example: '1/550e8400-e29b-41d4-a716-446655440000-image.png' },
              publicUrl: { type: 'string', example: 'https://project.supabase.co/storage/v1/object/public/immersion-images/1/image.png' },
              immersion: { $ref: '#/components/schemas/Immersion' }
            }
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Login realizado com sucesso' },
          token: { type: 'string', example: 'eyJhbGciOi...' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Usuario ou senha invalidos' }
        }
      }
    }
  },
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Login do usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLogin' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login bem sucedido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          '400': { description: 'Requisição inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '401': { description: 'Credenciais inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Dados do usuário autenticado',
        ...(authMeSecurity ? { security: authMeSecurity } : {}),
        responses: {
          '200': {
            description: 'Usuário autenticado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '401': { description: 'Token inválido ou ausente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/immersions': {
      get: {
        summary: 'Listar imersões',
        responses: {
          '200': {
            description: 'Lista de imersões',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    count: { type: 'integer' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Immersion' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Criar nova imersão',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'data', 'local', 'qtd_lote'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  data: { type: 'string', format: 'date' },
                  local: { type: 'string' },
                  qtd_lote: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Imersão criada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Immersion' }
                  }
                }
              }
            }
          }
        }
      },
      patch: {
        summary: 'Atualizar parcialmente uma imersão',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  data: { type: 'string', format: 'date' },
                  local: { type: 'string' },
                  qtd_lote: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Imersão atualizada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Immersion' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/immersions/{id}/image': {
      post: {
        summary: 'Enviar imagem da imersão para o Supabase',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['id', 'image'],
                properties: {
                  id: {
                    type: 'integer',
                    example: 1,
                    description: 'ID da imersão usado pelo upload da imagem'
                  },
                  image: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Imagem enviada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ImmersionImageUploadResponse' }
              }
            }
          },
          '400': {
            description: 'Requisição inválida',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '503': {
            description: 'Supabase storage não configurado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/lots': {
      get: {
        summary: 'Listar lotes',
        responses: {
          '200': {
            description: 'Lista de lotes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    count: { type: 'integer' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/LotWithImmersion' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Criar novo lote',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id_immersion', 'lote_number', 'valor', 'quantity_available', 'data_inicio', 'data_fim'],
                properties: {
                  id_immersion: { type: 'integer' },
                  lote_number: { type: 'integer' },
                  valor: { type: 'number', format: 'float' },
                  quantity_available: { type: 'integer' },
                  data_inicio: { type: 'string', format: 'date' },
                  data_fim: { type: 'string', format: 'date' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Lote criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Lot' }
                  }
                }
              }
            }
          }
        }
      },
      patch: {
        summary: 'Atualizar parcialmente um lote',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  valor: { type: 'number', format: 'float' },
                  quantity_available: { type: 'integer' },
                  data_inicio: { type: 'string', format: 'date' },
                  data_fim: { type: 'string', format: 'date' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Lote atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Lot' }
                  }
                }
              }
            }
          }
        }
      }
    },
  }
};
