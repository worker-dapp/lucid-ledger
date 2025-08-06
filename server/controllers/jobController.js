import { query } from '../config/database.js';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req, res) => {
  try {
    const sql = `
      SELECT
        id,
        title,
        location_type,
        location,
        company_name,
        notification_email,
        reference_code,
        job_type,
        salary,
        currency,
        pay_frequency,
        additional_compensation,
        employee_benefits,
        description,
        selected_oracles,
        verification_notes,
        responsibilities,
        skills,
        associated_skills,
        company_description,
        employer_id,
        status,
        created_at,
        updated_at
      FROM jobs
      ORDER BY created_at DESC
    `;

    const result = await query(sql);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching jobs'
    });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        id,
        title,
        location_type,
        location,
        company_name,
        notification_email,
        reference_code,
        job_type,
        salary,
        currency,
        pay_frequency,
        additional_compensation,
        employee_benefits,
        description,
        selected_oracles,
        verification_notes,
        responsibilities,
        skills,
        associated_skills,
        company_description,
        employer_id,
        status,
        created_at,
        updated_at
      FROM jobs
      WHERE id = $1
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching job'
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req, res) => {
  try {
    const {
      title,
      location_type,
      location,
      company_name,
      notification_email,
      reference_code,
      job_type,
      salary,
      currency,
      pay_frequency,
      additional_compensation,
      employee_benefits,
      description,
      selected_oracles,
      verification_notes,
      responsibilities,
      skills,
      associated_skills,
      company_description
    } = req.body;

    const employer_id = req.user.id; // Get employer ID from authenticated user

    const sql = `
      INSERT INTO jobs (
        title,
        location_type,
        location,
        company_name,
        notification_email,
        reference_code,
        job_type,
        salary,
        currency,
        pay_frequency,
        additional_compensation,
        employee_benefits,
        description,
        selected_oracles,
        verification_notes,
        responsibilities,
        skills,
        associated_skills,
        company_description,
        employer_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING id, title, company_name, employer_id, created_at
    `;

    const result = await query(sql, [
      title,
      location_type,
      location,
      company_name,
      notification_email,
      reference_code,
      job_type,
      salary,
      currency,
      pay_frequency,
      additional_compensation,
      employee_benefits,
      description,
      selected_oracles,
      verification_notes,
      responsibilities,
      skills,
      associated_skills,
      company_description,
      employer_id
    ]);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating job'
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
export const updateJob = async (req, res) => {
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
      UPDATE jobs
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, title, company_name, employer_id, updated_at
    `;

    const result = await query(sql, [id, ...values]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating job'
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'DELETE FROM jobs WHERE id = $1 RETURNING id, title';

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting job'
    });
  }
}; 