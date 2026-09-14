const ClienteService = require('../services/ClienteService')

class ClienteController {
    // Lista clientes
    async listar(req, res) {
        try {
            const clientes = await ClienteService.listar()
            res.json(clientes)
        } catch (erro) {
            res.status(500).json({ mensagem: erro.message || erro.mensagem })
        }
    }

    // Busca cliente
    async buscarPorId(req, res) {
        try {
            const cliente = await ClienteService.buscarPorId(req.params.id)
            res.json(cliente)
        } catch (erro) {
            res.status(500).json({ mensagem: erro.message || erro.mensagem })
        }
    }

    // Cria cliente
    async criar(req, res) {
        try {
            const cliente = await ClienteService.criar(req.body)
            res.status(201).json(cliente)
        } catch (erro) {
            res.status(erro.status || 500).json({ mensagem: erro.message || erro.mensagem })
        }
    }

    // Atualiza cliente
    async atualizar(req, res) {
        try {
            const cliente = await ClienteService.atualizar(req.params.id, req.body)
            res.json(cliente)
        } catch (erro) {
            res.status(erro.status || 500).json({ mensagem: erro.message || erro.mensagem })
        }
    }

    // Exclui cliente
    async excluir(req, res) {
        try {
            const cliente = await ClienteService.excluir(req.params.id)
            res.json(cliente)
        } catch (erro) {
            res.status(erro.status || 500).json({ mensagem: erro.message || erro.mensagem })
        }
    }
}

module.exports = new ClienteController()
const ClienteService = require('../services/ClienteService')

class ClienteController {
    // Lista clientes
    async listar(req, res) {
        try {
            const clientes = await ClienteService.listar()
            res.json(clientes)
        } catch (erro) {
            res.status(500).json({ mensagem: erro.message || erro.mensagem })
        }
    }

    // Busca cliente
    async buscarPorId(req, res) {
        try {
            const cliente = await ClienteService.buscarPorId(req.params.id)
            res.json(cliente)
        } catch (erro) {
            res.status(500).json({ mensagem: erro.message || erro.mensagem })
        }
    }

    // Cria cliente
    async criar(req, res) {
        try {
            const cliente = await ClienteService.criar(req.body)
            res.status(201).json(cliente)
        } catch (erro) {
            res.status(erro.status || 500).json({ mensagem: erro.message || erro.mensagem })
        }
    }

    // Atualiza cliente
    async atualizar(req, res) {
        try {
            const cliente = await ClienteService.atualizar(req.params.id, req.body)
            res.json(cliente)
        } catch (erro) {
            res.status(erro.status || 500).json({ mensagem: erro.message || erro.mensagem })
        }
    }

    // Exclui cliente
    async excluir(req, res) {
        try {
            const cliente = await ClienteService.excluir(req.params.id)
            res.json(cliente)
        } catch (erro) {
            res.status(erro.status || 500).json({ mensagem: erro.message || erro.mensagem })
        }
    }
}

module.exports = new ClienteController()
