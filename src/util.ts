import { stripHtml as stringStripHtml } from "string-strip-html";
import { config } from "./config.ts";

// 文頭に含まれているかもしれない @~~~ という形式のメンションを削除する
export function removeMentionFromText(text: string) {
    return text.replace(/^@[\w-]+\s*/gm, "");
}

export function stripHtml(html: string) {
    return stringStripHtml(html, {
        skipHtmlDecoding: true,
    }).result;
}

// validである場合trueを返す
export function checkSecretInUrl(url: string) {
    const urlObj = new URL(url);
    const secret = urlObj.searchParams.get("secret");
    if (secret === null) {
        return false;
    }
    return secret === config.SECRET;
}

export function getDiceNumbers(text: string): [number, number] {
    const regex = /(\d+)d(\d+)/;
    const match = text.match(regex);
    if (match === null) {
        throw new Error("invalid text");
    }

    const [_, first, second] = match;

    return [Number(first), Number(second)];
}

export function roll(noOfDice: number, sides: number) {
    return [...Array(noOfDice)]
        .map(() => Math.floor(Math.random() * sides + 1))
        .join(", ");
}
