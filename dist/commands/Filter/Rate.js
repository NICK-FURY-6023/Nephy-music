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
        this.name = ['rate'];
        this.description = 'Sets the rate of the song.';
        this.category = 'Filter';
        this.accessableby = [Accessableby.Member];
        this.usage = '<number>';
        this.aliases = ['rate'];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: 'amount',
                description: 'The amount of rate to set the song to.',
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const value = handler.args[0];
            if (value && isNaN(+value))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'error', 'number_invalid')}`)
                            .setColor(client.color),
                    ],
                });
            const player = client.rainlink.players.get(handler.guild.id);
            if (Number(value) < 0)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'filter_greater')}`)
                            .setColor(client.color),
                    ],
                });
            if (Number(value) > 10)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'filter_less')}`)
                            .setColor(client.color),
                    ],
                });
            player === null || player === void 0 ? void 0 : player.filter.setTimescale({ rate: Number(value) });
            player === null || player === void 0 ? void 0 : player.data.set('filter-mode', this.name[0]);
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'rate_on', {
                amount: value,
            })}`)
                .setColor(client.color);
            yield handler.editReply({ content: ' ', embeds: [embed] });
        });
    }
}
