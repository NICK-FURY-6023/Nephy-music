var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PermissionFlagsBits } from "discord.js";
export class CheckPermissionServices {
    interaction(interaction, permArray) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const voiceChannel = yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(interaction.user.id).catch(() => undefined));
            const isUserInVoice = voiceChannel === null || voiceChannel === void 0 ? void 0 : voiceChannel.voice.channel;
            const isUserInText = yield ((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.channels.fetch(String(interaction.channelId)).catch(() => undefined));
            for (const permBit of permArray) {
                if (isUserInVoice && !isUserInVoice.permissionsFor((_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.members.me).has(permBit)) {
                    return {
                        result: String(this.getPermissionName(permBit)),
                        channel: isUserInVoice.id,
                    };
                }
                if (isUserInText && !isUserInText.permissionsFor(interaction.guild.members.me).has(permBit))
                    return {
                        result: String(this.getPermissionName(permBit)),
                        channel: isUserInText.id,
                    };
                if (!interaction.guild.members.me.permissions.has(permBit)) {
                    return {
                        result: String(this.getPermissionName(permBit)),
                        channel: "Self",
                    };
                }
            }
            return {
                result: "PermissionPass",
                channel: "Pass",
            };
        });
    }
    message(message, permArray) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const voiceChannel = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id).catch(() => undefined));
            const isUserInVoice = voiceChannel === null || voiceChannel === void 0 ? void 0 : voiceChannel.voice.channel;
            const isUserInText = yield ((_b = message.guild) === null || _b === void 0 ? void 0 : _b.channels.fetch(String(message.channelId)).catch(() => undefined));
            for (const permBit of permArray) {
                if (isUserInVoice && !isUserInVoice.permissionsFor((_c = message.guild) === null || _c === void 0 ? void 0 : _c.members.me).has(permBit)) {
                    return {
                        result: String(this.getPermissionName(permBit)),
                        channel: isUserInVoice.id,
                    };
                }
                if (isUserInText && !isUserInText.permissionsFor(message.guild.members.me).has(permBit))
                    return {
                        result: String(this.getPermissionName(permBit)),
                        channel: isUserInText.id,
                    };
                if (!message.guild.members.me.permissions.has(permBit)) {
                    return {
                        result: String(this.getPermissionName(permBit)),
                        channel: "Self",
                    };
                }
            }
            return {
                result: "PermissionPass",
                channel: "Pass",
            };
        });
    }
    getPermissionName(permission) {
        for (const perm of Object.keys(PermissionFlagsBits)) {
            if (PermissionFlagsBits[perm] === permission) {
                return perm;
            }
        }
        return "UnknownPermission";
    }
}
