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
        this.name = ['equalizer'];
        this.description = 'Custom Equalizer!';
        this.category = 'Filter';
        this.accessableby = [Accessableby.Member];
        this.usage = '<number>';
        this.aliases = ['equalizer'];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: 'bands',
                description: 'Number of bands to use (max 14 bands.)',
                type: ApplicationCommandOptionType.String,
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
            if (!value) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.i18n.get(handler.language, 'command.filter', 'eq_author')}`,
                    iconURL: `${client.i18n.get(handler.language, 'command.filter', 'eq_icon')}`,
                })
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'eq_desc')}`)
                    .addFields({
                    name: `${client.i18n.get(handler.language, 'command.filter', 'eq_field_title')}`,
                    value: `${client.i18n.get(handler.language, 'command.filter', 'eq_field_value', {
                        prefix: handler.prefix,
                    })}`,
                    inline: false,
                })
                    .setFooter({
                    text: `${client.i18n.get(handler.language, 'command.filter', 'eq_footer', {
                        prefix: handler.prefix,
                    })}`,
                });
                return handler.editReply({ embeds: [embed] });
            }
            else if (value == 'off' || value == 'reset')
                return player === null || player === void 0 ? void 0 : player.filter.clear();
            const bands = value.split(/[ ]+/);
            let bandsStr = '';
            for (let i = 0; i < bands.length; i++) {
                if (i > 13)
                    break;
                if (isNaN(+bands[i]))
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'eq_number')}`)
                                .setColor(client.color),
                        ],
                    });
                if (Number(bands[i]) > 10)
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'eq_than')}`)
                                .setColor(client.color),
                        ],
                    });
                if (Number(bands[i]) < -10)
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'eq_greater')}`)
                                .setColor(client.color),
                        ],
                    });
            }
            for (let i = 0; i < bands.length; i++) {
                if (i > 13)
                    break;
                player === null || player === void 0 ? void 0 : player.filter.setEqualizer([{ band: i, gain: Number(bands[i]) / 10 }]);
                bandsStr += `${bands[i]} `;
            }
            player === null || player === void 0 ? void 0 : player.data.set('filter-mode', this.name[0]);
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'eq_on', {
                bands: bandsStr,
            })}`)
                .setColor(client.color);
            return handler.editReply({ content: ' ', embeds: [embed] });
        });
    }
}
