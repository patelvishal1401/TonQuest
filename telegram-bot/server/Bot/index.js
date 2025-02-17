import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const webAppUrl = process.env.WEBAPP_URL;

bot.start(async (ctx) => {
    const imageUrl = `https://wallet.tg/images/logo-288.png`;
    const description = `
Hi, @${ctx.message.from.first_name}!

Connect Wallet & Complete Tasks to get rewards.
Let’s go!
`;

    ctx.replyWithPhoto(
        { url: imageUrl },
        {
            caption: description,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Open", web_app: { url: webAppUrl } }],
                ],
            },
        }
    );
});

export default bot;