import express, {} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from './middleware/auth.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Applier Server is running' });
});
app.get('/api/v1/profile', authMiddleware, (req, res) => {
    res.json({
        message: 'Profile data retrieved successfully',
        user: req.user
    });
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map