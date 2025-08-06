import express from 'express';
import { getContracts, getContractById, createContract, updateContract } from '../controllers/contractController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/contracts - Get all contracts
router.get('/', getContracts);

// GET /api/contracts/:id - Get contract by ID
router.get('/:id', getContractById);

// POST /api/contracts - Create new contract
router.post('/', createContract);

// PUT /api/contracts/:id - Update contract
router.put('/:id', updateContract);

export default router; 