import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Server API Documentation',
      version: '1.0.0',
      description: 'API documentation for uploading videos, transcribing, and generating MCQs',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);
export default specs;