import { login } from "masto";
import { config } from "../config.ts";

export async function createClient() {
    const client = await login({
        url: config.MASTODON_BOT_HOST,
        accessToken: config.MASTODON_BOT_TOKEN,
    });
    return client;
}

export function createPostText(toAcct: string, text: string) {
    return `@${toAcct} ${text}`;
}
