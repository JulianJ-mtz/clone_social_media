import { pool } from '../db.js'

export const getUsers = async (req, res) => {
  try {
    const response = await pool.query('SELECT * FROM users')
    res.json(response.rows)
  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const response = await pool.query('SELECT * FROM users WHERE id = $1', [
      id
    ])

    if (response?.rows?.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.send(response.rows[0])
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const response = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password]
    )

    res.json(response.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email already exists' })
    }

    console.error('Error creating user:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, password } = req.body

    const response = await pool.query(
      'UPDATE users SET name = $1, email = $2, password_hash = $3 WHERE id = $4 RETURNING *',
      [name, email, password, id]
    )

    if (response.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(204).json()
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email already exists' })
    }

    console.error('Error updating user:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const response = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    )

    if (response?.rows?.length !== 1) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(204).json()
  } catch (error) {
    console.error('Error deleting user:', error)

    return res.status(500).json({ message: 'Internal server error' })
  }
}
