import { query } from '../config/database.js';

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
export const getContracts = async (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        title,
        description,
        employer_id,
        employee_id,
        status,
        payment_rate,
        payment_frequency,
        location,
        created_at,
        updated_at
      FROM contracts
      ORDER BY created_at DESC
    `;
    
    const result = await query(sql);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching contracts'
    });
  }
};

// @desc    Get contract by ID
// @route   GET /api/contracts/:id
// @access  Private
export const getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        id,
        title,
        description,
        employer_id,
        employee_id,
        status,
        payment_rate,
        payment_frequency,
        location,
        created_at,
        updated_at
      FROM contracts
      WHERE id = $1
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching contract'
    });
  }
};

// @desc    Create new contract
// @route   POST /api/contracts
// @access  Private
export const createContract = async (req, res) => {
  try {
    const {
      title,
      description,
      employer_id,
      employee_id,
      status = 'open',
      payment_rate,
      payment_frequency,
      location
    } = req.body;

    const sql = `
      INSERT INTO contracts (
        title,
        description,
        employer_id,
        employee_id,
        status,
        payment_rate,
        payment_frequency,
        location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, description, employer_id, employee_id, status, payment_rate, payment_frequency, location, created_at
    `;
    
    const result = await query(sql, [
      title,
      description,
      employer_id,
      employee_id,
      status,
      payment_rate,
      payment_frequency,
      location
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating contract'
    });
  }
};

// @desc    Update contract
// @route   PUT /api/contracts/:id
// @access  Private
export const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Build dynamic update query
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const sql = `
      UPDATE contracts 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, title, description, employer_id, employee_id, status, payment_rate, payment_frequency, location, updated_at
    `;
    
    const result = await query(sql, [id, ...values]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contract updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating contract'
    });
  }
}; 