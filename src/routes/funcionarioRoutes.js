const express = require("express");
const router = express.Router();
const FuncionarioController = require("../controllers/FuncionarioController");

// Define as rotas para a entidade Funcionário
// GET /funcionarios -> Chama o método listar do FuncionarioController
router.get("/", FuncionarioController.listar);

// GET /funcionarios/:id -> Chama o método buscarPorId do FuncionarioController
router.get("/:id", FuncionarioController.buscarPorId);

// POST /funcionarios -> Chama o método cadastrar do FuncionarioController
router.post("/", FuncionarioController.cadastrar);

// PUT /funcionarios/:id -> Chama o método atualizar do FuncionarioController
router.put("/:id", FuncionarioController.atualizar);

// DELETE /funcionarios/:id -> Chama o método deletar do FuncionarioController
router.delete("/:id", FuncionarioController.deletar);

module.exports = router;
