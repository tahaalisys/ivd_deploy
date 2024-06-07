const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IVD-Dividend API",
      version: "1.0.0",
      description: "Documentation for IVD-Dividend API",
    },
    servers: [
      {
        url: "http://192.168.0.107:8080", // Update with your API base URL
      },
      {
        url: "http://localhost:8080", // Update with your API base URL
      },
      {
        url: "http://192.168.0.111:8080", // Update with your API base URL
      },
      // Add more servers if needed (e.g., production server)
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/Routes/*.js"], // Update with the path to your route files
};

const specs = swaggerJsdoc(options);
module.exports = specs;
