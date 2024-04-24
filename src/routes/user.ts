import {Router} from 'express';

import * as feedControllers from '../controllers/user';
import {body, ValidationChain} from 'express-validator';

const router = Router();

router.post('/upload/:creator_id', 
[
    body('content', 'You can not upload an empty file')
    .not().isEmpty()
] as ValidationChain[], 
feedControllers.postFile
);

router.post('/share/:sharer_id', 
[
    body('username', 'Username not provided')
    .not().isEmpty()
] as ValidationChain[],
feedControllers.postShareFile);

router.get('/files/:accessor_id', feedControllers.getAllFiles);

export default router;