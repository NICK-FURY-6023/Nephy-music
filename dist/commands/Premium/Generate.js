var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import moment from "moment";
import voucher_codes from "voucher-code-generator";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["pm", "generate"];
        this.description = "Generate a premium code!";
        this.category = "Premium";
        this.accessableby = Accessableby.Admin;
        this.usage = "<type> <number>";
        this.aliases = [];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "plan",
                description: "Avalible: daily, weekly, monthly, yearly",
                required: true,
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: "Daily",
                        value: "daily",
                    },
                    {
                        name: "Weekly",
                        value: "weekly",
                    },
                    {
                        name: "Monthly",
                        value: "monthly",
                    },
                    {
                        name: "Yearly",
                        value: "yearly",
                    },
                    {
                        name: "Lifetime",
                        value: "lifetime",
                    },
                ],
            },
            {
                name: "amount",
                description: "The song link or name",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield handler.deferReply();
            const plans = ["daily", "weekly", "monthly", "yearly", "lifetime"];
            const name = handler.args[0];
            const camount = Number(handler.args[1]);
            if (!name || !plans.includes(name))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "arg_error", {
                            text: "**daily**, **weekly**, **monthly**, **yearly**, **lifetime**!",
                        })}`)
                            .setColor(client.color),
                    ],
                });
            if (!camount)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "arg_error", {
                            text: "**Number**!",
                        })}`)
                            .setColor(client.color),
                    ],
                });
            let codes = [];
            const plan = name;
            let time;
            if (plan === "daily")
                time = Date.now() + 86400000;
            if (plan === "weekly")
                time = Date.now() + 86400000 * 7;
            if (plan === "monthly")
                time = Date.now() + 86400000 * 30;
            if (plan === "yearly")
                time = Date.now() + 86400000 * 365;
            if (plan === "lifetime")
                time = "lifetime";
            let amount = camount;
            if (!amount)
                amount = 1;
            for (var i = 0; i < amount; i++) {
                const codePremium = voucher_codes.generate({
                    pattern: "#############-#########-######",
                });
                const code = codePremium.toString().toUpperCase();
                const find = yield client.db.code.get(`${code}`);
                if (!find) {
                    yield client.db.code.set(`${code}`, {
                        code: code,
                        plan: plan,
                        expiresAt: time,
                    });
                    codes.push(`${i + 1} - ${code}`);
                }
            }
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({
                name: `${client.getString(handler.language, "command.premium", "gen_author")}`,
                iconURL: client.user.displayAvatarURL(),
            })
                .setDescription(`${client.getString(handler.language, "command.premium", "gen_desc", {
                codes_length: String(codes.length),
                codes: codes.join("\n"),
                plan: String(plan),
                expires: time == "lifetime" ? "lifetime" : moment(time).format("dddd, MMMM Do YYYY"),
            })}`)
                .setTimestamp()
                .setFooter({
                text: `${client.getString(handler.language, "command.premium", "gen_footer", {
                    prefix: "/",
                })}`,
                iconURL: (_a = handler.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL(),
            });
            handler.editReply({ embeds: [embed] });
        });
    }
}
