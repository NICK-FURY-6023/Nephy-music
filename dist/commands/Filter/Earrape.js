var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder } from 'discord.js';
import { Accessableby } from '../../structures/Command.js';
export default class {
    constructor() {
        this.name = ['earrape'];
        this.description = 'Turning on earrape filter (extended by rainy)';
        this.category = 'Filter';
        this.accessableby = [Accessableby.Member];
        this.usage = '';
        this.aliases = ['earrape'];
        this.lavalink = true;
        this.options = [];
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const player = client.rainlink.players.get(handler.guild.id);
            if ((player === null || player === void 0 ? void 0 : player.data.get('filter-mode')) == this.name[0]) {
                const filterInvalid = new EmbedBuilder()
                    .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'filter_already', {
                    name: this.name[0],
                })}`)
                    .setColor(client.color);
                return handler.editReply({
                    embeds: [filterInvalid],
                });
            }
            player === null || player === void 0 ? void 0 : player.data.set('filter-mode', this.name[0]);
            player === null || player === void 0 ? void 0 : player.filter.setVolume(500);
            const earrapped = new EmbedBuilder()
                .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'filter_on', {
                name: this.name[0],
            })}`)
                .setColor(client.color);
            yield handler.editReply({ content: ' ', embeds: [earrapped] });
        });
    }
}
