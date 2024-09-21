var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import moment from "moment";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["pm", "redeem"];
        this.description = "Redeem your premium!";
        this.category = "Premium";
        this.accessableby = Accessableby.Member;
        this.usage = "<input>";
        this.aliases = [];
        this.lavalink = false;
        this.usingInteraction = true;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "code",
                description: "The code you want to redeem",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            yield handler.deferReply();
            const input = handler.args[0];
            if (!input)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.getString(handler.language, "command.premium", "redeem_invalid")}`),
                    ],
                });
            let member = yield client.db.premium.get(`${(_a = handler.user) === null || _a === void 0 ? void 0 : _a.id}`);
            if (member && member.isPremium) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.getString(handler.language, "command.premium", "redeem_already")}`);
                return handler.editReply({ embeds: [embed] });
            }
            const premium = yield client.db.code.get(`${input.toUpperCase()}`);
            if (!premium) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.getString(handler.language, "command.premium", "redeem_invalid")}`);
                return handler.editReply({ embeds: [embed] });
            }
            if (premium.expiresAt !== "lifetime" && premium.expiresAt < Date.now()) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.getString(handler.language, "command.premium", "redeem_invalid")}`);
                return handler.editReply({ embeds: [embed] });
            }
            const expires = moment(premium.expiresAt !== "lifetime" ? premium.expiresAt : 0).format("dddd, MMMM Do YYYY");
            const embed = new EmbedBuilder()
                .setAuthor({
                name: `${client.getString(handler.language, "command.premium", "redeem_title")}`,
                iconURL: client.user.displayAvatarURL(),
            })
                .setDescription(`${client.getString(handler.language, "command.premium", "redeem_desc", {
                expires: premium.expiresAt !== "lifetime" ? expires : "lifetime",
                plan: premium.plan,
            })}`)
                .setColor(client.color)
                .setTimestamp();
            const newPreUser = yield client.db.premium.set(`${(_b = handler.user) === null || _b === void 0 ? void 0 : _b.id}`, {
                id: String((_c = handler.user) === null || _c === void 0 ? void 0 : _c.id),
                isPremium: true,
                redeemedBy: handler.user,
                redeemedAt: Date.now(),
                expiresAt: premium.expiresAt,
                plan: premium.plan,
            });
            yield handler.editReply({ embeds: [embed] });
            yield client.db.code.delete(`${input.toUpperCase()}`);
            yield this.sendRedeemLog(client, newPreUser, handler.user);
            return;
        });
    }
    sendRedeemLog(client, premium, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.config.features.PREMIUM_LOG_CHANNEL)
                return;
            const language = client.config.bot.LANGUAGE;
            const embed = new EmbedBuilder()
                .setAuthor({
                name: `${client.getString(language, "event.premium", "title")}`,
            })
                .addFields([
                {
                    name: `${client.getString(language, "event.premium", "display_name")}`,
                    value: `${user === null || user === void 0 ? void 0 : user.displayName}`,
                },
                {
                    name: `${client.getString(language, "event.premium", "username")}`,
                    value: `${user === null || user === void 0 ? void 0 : user.username}`,
                },
                {
                    name: "ID",
                    value: `${user === null || user === void 0 ? void 0 : user.id}`,
                },
                {
                    name: `${client.getString(language, "event.premium", "createdAt")}`,
                    value: `${moment(user === null || user === void 0 ? void 0 : user.createdAt.getTime()).format("dddd, MMMM Do YYYY")}`,
                },
                {
                    name: `${client.getString(language, "event.premium", "redeemedAt")}`,
                    value: `${moment(premium.redeemedAt).format("dddd, MMMM Do YYYY")}`,
                },
                {
                    name: `${client.getString(language, "event.premium", "expiresAt")}`,
                    value: `${premium.expiresAt == "lifetime" ? "lifetime" : moment(premium.expiresAt).format("dddd, MMMM Do YYYY")}`,
                },
                {
                    name: `${client.getString(language, "event.premium", "plan")}`,
                    value: `${premium.plan}`,
                },
            ])
                .setTimestamp()
                .setColor(client.color);
            try {
                const channel = yield client.channels.fetch(client.config.features.PREMIUM_LOG_CHANNEL).catch(() => undefined);
                if (!channel || (channel && !channel.isTextBased()))
                    return;
                channel.messages.channel.send({ embeds: [embed] });
            }
            catch (_a) { }
            return;
        });
    }
}
