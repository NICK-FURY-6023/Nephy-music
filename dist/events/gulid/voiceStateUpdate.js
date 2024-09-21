var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { RainlinkPlayerState } from "../../rainlink/main.js";
export default class {
    execute(client, oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            if (!client.isDatabaseConnected)
                return client.logger.warn(import.meta.url, "The database is not yet connected so this event will temporarily not execute. Please try again later!");
            const player = (_a = client.rainlink) === null || _a === void 0 ? void 0 : _a.players.get(newState.guild.id);
            if (!player)
                return;
            const is247 = yield client.db.autoreconnect.get(`${newState.guild.id}`);
            if (newState.channelId == null && ((_b = newState.member) === null || _b === void 0 ? void 0 : _b.user.id) === ((_c = client.user) === null || _c === void 0 ? void 0 : _c.id)) {
                player.data.set("sudo-destroy", true);
                player.state !== RainlinkPlayerState.DESTROYED ? player.destroy() : true;
            }
            if (((_d = oldState.member) === null || _d === void 0 ? void 0 : _d.user.bot) || ((_e = newState.member) === null || _e === void 0 ? void 0 : _e.user.bot))
                return;
            let data = yield new AutoReconnectBuilderService(client).get(newState.guild.id);
            const setup = yield client.db.setup.get(newState.guild.id);
            let guildModel = yield client.db.language.get(`${newState.guild.id}`);
            if (!guildModel) {
                guildModel = yield client.db.language.set(`${newState.guild.id}`, client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            if (data && data.twentyfourseven)
                return;
            const isInVoice = yield newState.guild.members.fetch(client.user.id).catch(() => undefined);
            if (!isInVoice || !isInVoice.voice.channelId) {
                player.data.set("sudo-destroy", true);
                player.state !== RainlinkPlayerState.DESTROYED ? player.destroy() : true;
            }
            if (newState.channelId &&
                String(newState.channel.type) == "GUILD_STAGE_VOICE" &&
                newState.guild.members.me.voice.suppress &&
                (newState.guild.members.me.permissions.has(PermissionsBitField.Flags.Connect) ||
                    (newState.channel &&
                        newState.channel
                            .permissionsFor(newState.guild.members.me)
                            .has(PermissionsBitField.Flags.Speak))))
                newState.guild.members.me.voice.setSuppressed(false);
            if (oldState.id === client.user.id)
                return;
            const isInOldVoice = yield oldState.guild.members.fetch(client.user.id).catch(() => undefined);
            if (!isInOldVoice || !isInOldVoice.voice.channelId)
                return;
            const vcRoom = oldState.guild.members.me.voice.channel.id;
            const leaveEmbed = (yield client.channels.fetch(player.textId).catch(() => undefined));
            if (((_f = newState.guild.members.me.voice) === null || _f === void 0 ? void 0 : _f.channel) &&
                newState.guild.members.me.voice.channel.members.filter((m) => !m.user.bot).size !== 0) {
                if (oldState.channelId)
                    return;
                if (oldState.channelId === newState.channelId)
                    return;
                if (newState.guild.members.me.voice.channel.members.filter((m) => !m.user.bot).size > 2)
                    return;
                // Resume player
                const leaveTimeout = client.leaveDelay.get(newState.guild.id);
                if (leaveTimeout) {
                    clearTimeout(leaveTimeout);
                    client.leaveDelay.delete(newState.guild.id);
                }
                const currentPause = player.paused;
                player.paused == false ? true : player.setPause(false);
                if (currentPause !== false && player.track !== null) {
                    const msg = leaveEmbed
                        ? yield leaveEmbed.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(`${client.getString(language, "event.player", "leave_resume")}`)
                                    .setColor(client.color),
                            ],
                        })
                        : null;
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () { return (!setup || setup == null || setup.channel !== player.textId) && msg ? msg.delete().catch(() => null) : true; }), client.config.bot.DELETE_MSG_TIMEOUT);
                }
            }
            if (isInOldVoice &&
                isInOldVoice.voice.channelId === oldState.channelId &&
                ((_g = oldState.guild.members.me.voice) === null || _g === void 0 ? void 0 : _g.channel) &&
                oldState.guild.members.me.voice.channel.members.filter((m) => !m.user.bot).size === 0) {
                // Pause player
                const currentPause = player.paused;
                player.paused == true ? true : player.setPause(true);
                if (currentPause !== true && player.track !== null) {
                    const msg = yield leaveEmbed.send({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(language, "event.player", "leave_pause")}`)
                                .setColor(client.color),
                        ],
                    });
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        const isChannelAvalible = yield client.channels.fetch(msg.channelId).catch(() => undefined);
                        if (!isChannelAvalible)
                            return;
                        !setup || setup == null || setup.channel !== player.textId ? msg.delete().catch(() => null) : true;
                    }), client.config.bot.DELETE_MSG_TIMEOUT);
                }
                // Delay leave timeout
                let leaveDelayTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    const vcMembers = (_a = oldState.guild.members.me.voice.channel) === null || _a === void 0 ? void 0 : _a.members.filter((m) => !m.user.bot).size;
                    if (!vcMembers || vcMembers === 1) {
                        const newPlayer = (_b = client.rainlink) === null || _b === void 0 ? void 0 : _b.players.get(newState.guild.id);
                        player.data.set("sudo-destroy", true);
                        if (newPlayer)
                            player.stop(is247 && is247.twentyfourseven ? false : true);
                        const TimeoutEmbed = new EmbedBuilder()
                            .setDescription(`${client.getString(language, "event.player", "player_end", {
                            leave: vcRoom,
                        })}`)
                            .setColor(client.color);
                        try {
                            if (leaveEmbed) {
                                const msg = newPlayer && leaveEmbed ? yield leaveEmbed.send({ embeds: [TimeoutEmbed] }) : undefined;
                                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                    return msg && (!setup || setup == null || setup.channel !== player.textId)
                                        ? msg.delete().catch(() => null)
                                        : undefined;
                                }), client.config.bot.DELETE_MSG_TIMEOUT);
                            }
                        }
                        catch (error) {
                            client.logger.error(import.meta.url, error);
                        }
                    }
                    clearTimeout(leaveDelayTimeout);
                    client.leaveDelay.delete(newState.guild.id);
                }), client.config.lavalink.LEAVE_TIMEOUT);
                client.leaveDelay.set(newState.guild.id, leaveDelayTimeout);
            }
        });
    }
}
