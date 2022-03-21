import axios from 'axios';
import { fetchBeans } from './bean';

interface IFederator {

    discord_id?: string,
    mail_address?: string,
    patreon_id: string,
    patreon_tier_id?: string,
}

const API_TOKEN = process.env.API_TOKEN;
const API_ENDPOINT_URL = process.env.API_ENDPOINT_URL;

const remoteAdd = async (boi: IFederator) => {

    const addboi = await axios.post(`${API_ENDPOINT_URL}`,
        {
            "discord_id": boi.discord_id,
            "mail_address": boi.mail_address,
            "patreon_id": boi.patreon_id,
            "patreon_tier_id": boi.patreon_tier_id

        }, {
            headers: {
                'Authorization' : `Token ${API_TOKEN}`,
                'Content-Type' : 'application/json',
        },
    });

    return true;
}

const remoteDelete = async (boi: IFederator) => {

    const remboi = await axios.delete(`${API_ENDPOINT_URL}`,
    {
        data : {
            "patreon_id": boi.patreon_id,
        },
        headers: {
                'Authorization' : `Token ${API_TOKEN}`,
                'Content-Type' : 'application/json',
        },
    });
    return true;
}
const remoteUpdate = async (boi: IFederator) => {

    const updboi = await axios.patch(`${API_ENDPOINT_URL}`,
    {
        "patreon_id": boi.patreon_id,
        "patreon_tier_id": boi.patreon_tier_id
    },
    {
        headers: {
                'Authorization' : `Token ${API_TOKEN}`,
                'Content-Type' : 'application/json',
        },
    });
}

const time = () => {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

export const update = async () => {

    console.log(`[${time()}] Read from remote API`)
    const users = await axios.get(`${API_ENDPOINT_URL}`, {
        headers: {
            'Authorization' : `Token ${API_TOKEN}`,
            'Content-Type' : 'application/json',
        },
    });

    const beans = await fetchBeans();

    for (const user of users.data) {

        const bean = beans.get(user.patreon_id);
        if (!bean || !bean.tier) {
            await remoteDelete(user)
        }
        else if (bean.tier !== user.patreon_tier_id) {
            await remoteUpdate({
                patreon_id: bean.patreon_id,
                patreon_tier_id: bean.tier
            });
        }
        beans.delete(user.patreon_id);
    }
    let counter = 0;
    let c2 = 0;
    for (const [patreon_id, bean] of beans) {

        if (!bean.tier) {

            continue;
        }
        try {
            await remoteAdd({
                discord_id: bean.discord_id,
                mail_address: bean.mail_address,
                patreon_id: patreon_id,
                patreon_tier_id: bean.tier
            });
        } catch (e: any) {
            if (!e.response.data) c2++;
            counter++;
        }
    }
    console.log(`Unrecognized: ${counter}`)
    console.log(`Fatal errors: ${c2}`)
}
