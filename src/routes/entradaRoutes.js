const express = require('express');
const router = express.Router();

const funcionarioRoutes = require('./funcionarioRoutes');
const produtoRoutes = require('./produtoRoutes');
const entradaRoutes = require('./entradaRoutes');

router.use('/funcionarios', funcionarioRoutes);
router.use('/produtos', produtoRoutes);
router.use('/entradas', entradaRoutes);

module.exports = router;