import swaggerJSDoc from 'swagger-jsdoc';

// Swagger definition
const swaggerDefinition = {
  info: { // API informations (required)
    title: 'YAMP', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'YAMP REST API', // Description (optional)
  },
  host: 'localhost:9000', // Host (optional)
  basePath: '/', // Base path (optional)
};

// Options for the swagger docs
const options = {
    // Import swaggerDefinitions
  swaggerDefinition,
    // Path to the API docs
  apis: ['./src/routes/*.js'],
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
