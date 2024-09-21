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
        this.name = ['television'];
        this.description = 'Turning on television filter (extended by rainy)';
        this.category = 'Filter';
        this.accessableby = [Accessableby.Member];
        this.usage = '';
        this.aliases = ['television'];
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
            player === null || player === void 0 ? void 0 : player.filter.setEqualizer([
                { band: 0, gain: 0 },
                { band: 1, gain: 0 },
                { band: 2, gain: 0 },
                { band: 3, gain: 0 },
                { band: 4, gain: 0 },
                { band: 5, gain: 0 },
                { band: 6, gain: 0 },
                { band: 7, gain: 0.65 },
                { band: 8, gain: 0.65 },
                { band: 9, gain: 0.65 },
                { band: 10, gain: 0.65 },
                { band: 11, gain: 0.65 },
                { band: 12, gain: 0.65 },
                { band: 13, gain: 0.65 },
            ]);
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'filter_on', {
                name: this.name[0],
            })}`)
                .setColor(client.color);
            yield handler.editReply({ content: ' ', embeds: [embed] });
        });
    }
}
