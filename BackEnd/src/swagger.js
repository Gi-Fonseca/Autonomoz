const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Sabor Digital API',
        description: 'Documentação automática da API Sabor Digital utilizando Swagger Autogen',
        version: '1.0.0'
    },
    host: 'localhost:3000',
    schemes: ['http'],

    securityDefinitions: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
        }
    }
};


const outputFile = './swagger_output.json';


const endpointsFiles = ['./src/routes/index.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log("Documentação do Swagger gerada com sucesso!");
});