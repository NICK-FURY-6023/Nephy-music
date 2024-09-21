var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { Accessableby } from '../../structures/Command.js';
export default class {
    constructor() {
        this.name = ['bassboost'];
        this.description = 'Turning on bassboost filter (extended by rainy)';
        this.category = 'Filter';
        this.accessableby = [Accessableby.Member];
        this.usage = '<number>';
        this.aliases = ['bassboost'];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: 'amount',
                description: 'The amount of the bassboost',
                type: ApplicationCommandOptionType.Number,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const value = handler.args[0];
            if (value && isNaN(+value)) {
                const filterNumberInvalid = new EmbedBuilder()
                    .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'filter_number')}`)
                    .setColor(client.color);
                return handler.editReply({
                    embeds: [filterNumberInvalid],
                });
            }
            const player = client.rainlink.players.get(handler.guild.id);
            if (!value) {
                player === null || player === void 0 ? void 0 : player.filter.set('bass');
                const embed = new EmbedBuilder()
                    .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'filter_on', {
                    name: 'Bassboost',
                })}`)
                    .setColor(client.color);
                return handler.editReply({ content: ' ', embeds: [embed] });
            }
            if (Number(value) > 10 || Number(value) < -10)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'bassboost_limit')}`)
                            .setColor(client.color),
                    ],
                });
            player === null || player === void 0 ? void 0 : player.filter.setEqualizer([
                { band: 0, gain: Number(value) / 10 },
                { band: 1, gain: Number(value) / 10 },
                { band: 2, gain: Number(value) / 10 },
                { band: 3, gain: Number(value) / 10 },
                { band: 4, gain: Number(value) / 10 },
                { band: 5, gain: Number(value) / 10 },
                { band: 6, gain: Number(value) / 10 },
                { band: 7, gain: 0 },
                { band: 8, gain: 0 },
                { band: 9, gain: 0 },
                { band: 10, gain: 0 },
                { band: 11, gain: 0 },
                { band: 12, gain: 0 },
                { band: 13, gain: 0 },
            ]);
            player === null || player === void 0 ? void 0 : player.data.set('filter-mode', this.name[0]);
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'bassboost_set', {
                amount: value,
            })}`)
                .setColor(client.color);
            return handler.editReply({ content: ' ', embeds: [embed] });
        });
    }
}
