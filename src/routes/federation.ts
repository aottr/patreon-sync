import { Router } from 'express';
import { body, check, validationResult } from 'express-validator';
import { createHmac } from 'crypto';
const router = Router();

const CAMPAIGN_WEBHOOK_KEY = process.env.SECRET || '';

const validateWebHook = (message: string, signature: string) : boolean => {

    const hmac = createHmac('md5', CAMPAIGN_WEBHOOK_KEY).update(message).digest('hex');
    console.log(hmac)
    console.log(signature)
    return signature === hmac;
}

router.get('/:federation/members', async (req, res) => {

    return res.status(200).json({});
});

router.post('/:federation/hook', async (req, res) => {

    console.log(req.body)
    console.log(req.headers)
    // validate request integrity
    if (!req.headers['X-Patreon-Signature']) return res.sendStatus(401);
    const signature = req.headers['X-Patreon-Signature'];
    if (signature instanceof Array) return res.sendStatus(401);
    if(!validateWebHook(req.body, signature)) return res.sendStatus(401);

    console.log(req.body)

    return res.status(200).json({});
});

export default router;
