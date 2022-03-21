import { Router } from 'express';
import { createHmac } from 'crypto';
const router = Router();

import { fetchBeans } from '../models/bean';
import { update } from '../models/fedUser';

const CAMPAIGN_WEBHOOK_KEY = process.env.SECRET || '';

const validateWebHook = (message: string, signature: string) : boolean => {

    const hmac = createHmac('md5', CAMPAIGN_WEBHOOK_KEY).update(message).digest('hex');
    console.log(hmac)
    console.log(signature)
    return signature === hmac;
}

router.head('/', async (req, res) => {

    await fetchBeans();
    return res.sendStatus(200);
});

router.post('/', async (req, res) => {

    await update();
    return res.sendStatus(200);
});

router.post('/:campaign/hook', async (req, res) => {

    console.log(req.body)
    console.log(req.headers)
    // validate request integrity
    // TODO exclude this call from bodyparser middleware

    if (!req.headers['x-patreon-signature']) return res.sendStatus(401);
    const signature = req.headers['x-patreon-signature'];
    if (signature instanceof Array) return res.sendStatus(401);
    if(!validateWebHook(req.body, signature)) return res.sendStatus(401);

    console.log(req.body)

    return res.status(200).json({});
});

export default router;
