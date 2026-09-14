const estoqueRoutes = require("./estoqueRoutes");
const loteRoutes = require("./loteRoutes");

router.use("/estoque", estoqueRoutes);
router.use("/lote", loteRoutes);
