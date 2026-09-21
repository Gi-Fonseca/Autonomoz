const express = require("express");
const router = express.Router();
const controller = require("../controllers/FuncionarioController");
const { autenticar, autorizar } = require("../middlewares/auth");

router.post("/login", controller.login);
router.use(autenticar);
router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);
router.post("/", autorizar("Gerente"), controller.cadastrar);
router.put("/:id", autorizar("Gerente"), controller.atualizar);
router.delete("/:id", autorizar("Gerente"), controller.deletar);

module.exports = router;
