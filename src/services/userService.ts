import pool from "@/libs/database";
import { RequestActionUser, User } from "@/types/userTypes";
import jwt from 'jsonwebtoken';

export const handleLogin = async (payload: { email: string; password: string }): Promise<User> => {
    const client = await pool.connect();

    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        const values = [payload.email];

        const res = await client.query(query, values);

        if (res.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = res.rows[0];

        if (user.password !== payload.password) {
            throw new Error('Invalid password');
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET_KEY || 'your_secret_key',
            { expiresIn: '12h' }
        );

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            token,
        };
    } catch (error: any) {
        throw new Error(error.message);
    } finally {
        client.release();
    }
};

export const handleActionManageUser = async (payload: RequestActionUser): Promise<User> => {
    const client = await pool.connect();

    try {
        let user: User | null = null;

        if (payload.id) {
            const query = 'SELECT * FROM users WHERE id = $1';
            const values = [payload.id];

            const res = await client.query(query, values);

            if (res.rows.length > 0) {
                user = res.rows[0];
            } else {
                throw new Error('User not found');
            }
        } else {
            const query = 'SELECT * FROM users WHERE email = $1';
            const values = [payload.email];

            const res = await client.query(query, values);

            if (res.rows.length > 0) {
                user = res.rows[0];
            } else {
                const insertQuery = `
                    INSERT INTO users (name, email, password)
                    VALUES ($1, $2, $3)
                    RETURNING id, name, email
                `;
                const insertValues = [payload.name, payload.email, payload.password]; // pastikan password di hash sebelum disimpan
                const insertRes = await client.query(insertQuery, insertValues);

                user = insertRes.rows[0]; // Ambil data pengguna yang baru dibuat
            }
        }

        return {
            id: user!.id,
            name: user!.name,
            email: user!.email,
            token: '',
        };

    } catch (error: any) {
        throw new Error(error.message);
    } finally {
        client.release();
    }
};