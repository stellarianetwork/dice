import "https://deno.land/std@0.188.0/dotenv/load.ts";

const configKeys = {
    SECRET: Deno.env.get("SECRET"),
    REACTION_ACCT_WHITELIST: Deno.env
        .get("REACTION_ACCT_WHITELIST")
        ?.split(","),
    MASTODON_BOT_HOST: Deno.env.get("MASTODON_BOT_HOST"),
    MASTODON_BOT_ACCT: Deno.env.get("MASTODON_BOT_ACCT"),
    MASTODON_BOT_TOKEN: Deno.env.get("MASTODON_BOT_TOKEN"),
};

(Object.keys(configKeys) as (keyof typeof configKeys)[]).forEach((key) => {
    if (configKeys[key] === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
    }
});

export const config = Object.freeze(configKeys) as {
    readonly [K in keyof typeof configKeys]: NonNullable<
        (typeof configKeys)[K]
    >;
};
