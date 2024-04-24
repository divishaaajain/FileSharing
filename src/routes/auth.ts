import {Router} from 'express';
import {body, ValidationChain} from 'express-validator';

import * as authControllers from '../controllers/auth';

const router = Router();

router.post('/signup', 
[
    body('username', 'Username should be between 3 to 15 characters')
    .isAlphanumeric()
    .withMessage('Username should only contain letters and numbers')
    .isLength({min:6, max: 15})
    .withMessage('Username should be between 3 to 15 letters')
    .isLowercase()
    .withMessage('Username cannot contain capital letters')
    .trim()
] as ValidationChain[],
authControllers.postSignup
);

export default router;