import { Document, Schema, model } from 'mongoose';
import axios from 'axios';

export interface IBean {
    patreon_id: string,
    discord_id?: string,
    mail_address?: string,
    tier?: string,
}

const beanSchema: Schema = new Schema({
    patreon_id: { type: String, required: true },
    discord_id: String,
    mail_address: String,
    tier: String
});

export const Bean = model<IBean>('bean', beanSchema);

const extract_discord_id = (included: Array<any>) : Map<string,string | undefined> => {

    const discord_ids = new Map<string, string | undefined>();
    const edid = (attr: any) : string | undefined => {

        if (!attr['social_connections']) return;
        if (!attr['social_connections']['discord']) return;

        return attr['social_connections']['discord']['user_id'];
    }

    for (const inc of included) {
        if (inc['type'] != 'user') continue;
        discord_ids.set(inc['id'], edid(inc['attributes']));
    }
    return discord_ids;
}

const extract_emails = (data: Array<any>) : Map<string, string | undefined> => {

    const emails = new Map<string, string | undefined>();

    for (const entry of data) {
        if (entry['type'] != 'member') continue;
        if (!entry['attributes']) continue;
        if (!entry['attributes']['email']) continue;

        const key = entry['relationships']['user']['data']['id'];

        emails.set(key,entry['attributes']['email'])
    }
    return emails;
};

const extract_user_data = (data: Array<any>) : Map<string, string | undefined> => {

    const user_data = new Map<string, string | undefined>();

    const et = (cet: any) : string | undefined => {

        if(!cet) return;

        for(const tier of cet['data']) {

            if (tier['type'] !== 'tier') return;
            return tier['id'];
        }

    }

    for (const entry of data) {
        if (entry['type'] != 'member') continue;
        if (!entry['relationships']) continue;
        if (!entry['relationships']['user']) continue;

        const key = entry['relationships']['user']['data']['id'];

        user_data.set(key,et(entry['relationships']['currently_entitled_tiers']))
    }
    return user_data;
};

export const fetchBeans = async () => {

    const retBeans = new Map<string, IBean>();

    const res = await axios.get(`https://www.patreon.com/api/oauth2/v2/campaigns/${process.env.CAMPAIGN}/members?include=currently_entitled_tiers,user&fields%5Bmember%5D=patron_status,email&fields%5Buser%5D=social_connections&page%5Bsize%5D=800`, {
        headers: {
            'Authorization' : `Bearer ${process.env.TOKEN}`,
            'Content-Type' : 'application/json',
        },
    });
    const users = extract_user_data(res.data['data']);
    const d_ids = extract_discord_id(res.data['included']);
    const mails = extract_emails(res.data['data']);

    for (const [patreon_id, tier] of users) {

        retBeans.set(patreon_id, {
            patreon_id: patreon_id,
            discord_id: d_ids.get(patreon_id),
            mail_address: mails.get(patreon_id),
            tier: tier
        });
    }
    return retBeans;
}

export default Bean;
