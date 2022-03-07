import { Document, Schema, model } from 'mongoose';

export interface IBean extends Document {
    patreon_id: string,
    discord_id?: string,
    tiers?: [{
        campaign: string,
        id: string,
        name: string,
    },]
}

const beanSchema: Schema = new Schema({
    patreon_id: { type: String, required: true },
    discord_id: String,
    tiers: [{
        campaign: String,
        id: String,
        name: String
    }],
});

export default model<IBean>('bean', beanSchema);
