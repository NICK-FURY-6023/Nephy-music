var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder } from "discord.js";
import moment from "moment";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["pm", "profile"];
        this.description = "View your premium profile!";
        this.category = "Premium";
        this.accessableby = Accessableby.Premium;
        this.usage = "";
        this.aliases = [];
        this.lavalink = false;
        this.usingInteraction = true;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            yield handler.deferReply();
            if (((_a = handler.user) === null || _a === void 0 ? void 0 : _a.id) == client.owner)
                return this.owner(client, handler);
            if (client.config.bot.ADMIN.includes((_c = (_b = handler.user) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : "null"))
                return this.admin(client, handler);
            const PremiumPlan = (yield client.db.premium.get(`${(_d = handler.user) === null || _d === void 0 ? void 0 : _d.id}`));
            const expires = moment(PremiumPlan && PremiumPlan.expiresAt !== "lifetime" ? PremiumPlan.expiresAt : 0).format("do/MMMM/YYYY (HH:mm:ss)");
            const embed = new EmbedBuilder()
                .setAuthor({
                name: `${client.getString(handler.language, "command.premium", "profile_author")}`,
                iconURL: client.user.displayAvatarURL(),
            })
                .setDescription(`${client.getString(handler.language, "command.premium", "profile_desc", {
                user: String((_e = handler.user) === null || _e === void 0 ? void 0 : _e.tag),
                plan: PremiumPlan.plan,
                expires: PremiumPlan.expiresAt == "lifetime" ? "lifetime" : expires,
            })}`)
                .setColor(client.color)
                .setTimestamp();
            return handler.editReply({ embeds: [embed] });
        });
    }
    owner(client, handler) {
        var _a;
        const embed = new EmbedBuilder()
            .setAuthor({
            name: `${client.getString(handler.language, "command.premium", "profile_author")}`,
            iconURL: client.user.displayAvatarURL(),
        })
            .setDescription(`${client.getString(handler.language, "command.premium", "profile_desc", {
            user: String((_a = handler.user) === null || _a === void 0 ? void 0 : _a.tag),
            plan: "dreamvast@owner",
            expires: "lifetime",
        })}`)
            .setColor(client.color)
            .setTimestamp();
        return handler.editReply({ embeds: [embed] });
    }
    admin(client, handler) {
        var _a;
        const embed = new EmbedBuilder()
            .setAuthor({
            name: `${client.getString(handler.language, "command.premium", "profile_author")}`,
            iconURL: client.user.displayAvatarURL(),
        })
            .setDescription(`${client.getString(handler.language, "command.premium", "profile_desc", {
            user: String((_a = handler.user) === null || _a === void 0 ? void 0 : _a.tag),
            plan: "dreamvast@admin",
            expires: "lifetime",
        })}`)
            .setColor(client.color)
            .setTimestamp();
        return handler.editReply({ embeds: [embed] });
    }
}
