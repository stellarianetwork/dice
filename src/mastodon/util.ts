import { mastodon } from "masto";
import { config } from "../config.ts";

// 投稿がbotによるものかを判定する
export function postIsByBot(post: mastodon.v1.Status) {
    return post.account.acct === config.MASTODON_BOT_ACCT;
}
