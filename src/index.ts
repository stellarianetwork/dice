import { serve } from "std/http/server.ts";
import { NotestockWebhookBodySceheme } from "./type.ts";
import { createClient, createPostText } from "./mastodon/api.ts";
import { config } from "./config.ts";
import { checkSecretInUrl, getDiceNumbers, roll, stripHtml } from "./util.ts";
import { getAcctFromAttributedTo, getPostIdFromUrl } from "./notestock/util.ts";

serve(async (req: Request): Promise<Response> => {
    if (!req.body) {
        return new Response(null, { status: 404 });
    }

    if (!checkSecretInUrl(req.url)) {
        console.log("secret is not correct");
        return new Response(null);
    }

    const body = new TextDecoder().decode(
        (await req.body?.getReader().read()).value
    );

    const nsBody = NotestockWebhookBodySceheme.safeParse(JSON.parse(body));
    if (!nsBody.success) {
        console.error(nsBody.error);
        return new Response("you have bad body!", { status: 400 });
    }
    const post = nsBody.data;
    const postContent = stripHtml(post.content);

    console.log("received: ", post.id, postContent);

    const botClient = await createClient();

    const postIsReply = !!post.tag.find((tag) => tag.type === "Mention");
    if (postIsReply) {
        const postIsReplyToBot = post.tag.find(
            (tag) =>
                tag.type === "Mention" &&
                tag.name === "@" + config.MASTODON_BOT_ACCT
        );
        if (!postIsReplyToBot) {
            console.log("post is reply, but not to bot");
            return new Response(null);
        }
        console.log("post is reply to bot");
    }

    const postByAllowedUser = config.REACTION_ACCT_WHITELIST?.includes(
        getAcctFromAttributedTo(post.attributedTo)
    );
    if (!postByAllowedUser) {
        console.log("post is not by allowed user");
        return new Response(null);
    }

    // この時点で、投稿はbotへのリプライか、リプライではない投稿
    const numbers = getDiceNumbers(postContent);
    const result = roll(...numbers);

    // ランダムにリプライする
    if (postIsReply) {
        // リプライなら必ず返信する
        await botClient.v1.statuses.create({
            status: createPostText(
                getAcctFromAttributedTo(post.attributedTo),
                result
            ),
            inReplyToId: getPostIdFromUrl(post.url),
            visibility: "unlisted",
        });
    } else {
        // 単一の投稿

        // リンクが含まれていたらやめる
        if (postContent.includes("http")) {
            console.log("don't bother now. (post has link)");
            return new Response(null);
        }

        // 引用で始まっていたらやめる
        if (postContent.startsWith(">")) {
            console.log("don't bother now. (post has quote)");
            return new Response(null);
        }

        // 文字がないならやめる
        if (postContent.length === 0) {
            console.log("don't bother now. (post is empty)");
            return new Response(null);
        }

        // 画像が含まれていたらやめる
        if (post.attachment.length > 0) {
            console.log("don't bother now. (post has image)");
            return new Response(null);
        }

        await botClient.v1.statuses.create({
            status: createPostText(
                getAcctFromAttributedTo(post.attributedTo),
                result
            ),
            inReplyToId: getPostIdFromUrl(post.url),
            visibility: "unlisted",
        });
    }

    return new Response("you have nice body!");
});
