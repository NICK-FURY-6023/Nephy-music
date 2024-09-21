var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { Accessableby } from '../../structures/Command.js';
import { RainlinkFilterData } from '../../rainlink/main.js';
export default class {
    constructor() {
        this.name = ['filter'];
        this.description = 'Turning on some built-in filter';
        this.category = 'Filter';
        this.accessableby = [Accessableby.Member];
        this.usage = '<filter_name>';
        this.aliases = [];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: 'name',
                description: 'The name of filter',
                type: ApplicationCommandOptionType.String,
                required: false,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const filterList = Object.keys(RainlinkFilterData).filter((e) => e !== 'clear');
            const filterName = handler.args[0];
            const player = client.rainlink.players.get(handler.guild.id);
            if (!filterName || !filterList.find((e) => e == filterName)) {
                const filterInvalid = new EmbedBuilder()
                    .setDescription(client.i18n.get(handler.language, 'command.filter', 'filter_avaliable', {
                    amount: String(filterList.length),
                    list: filterList.join(', '),
                }))
                    .setColor(client.color);
                return handler.editReply({ embeds: [filterInvalid] });
            }
            if (!(player === null || player === void 0 ? void 0 : player.data.get('filter-mode'))) {
                const filterReset = new EmbedBuilder()
                    .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'reset_already')}`)
                    .setColor(client.color);
                return handler.editReply({
                    embeds: [filterReset],
                });
            }
            if ((player === null || player === void 0 ? void 0 : player.data.get('filter-mode')) == filterName) {
                const filterInvalid = new EmbedBuilder()
                    .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'filter_already', {
                    name: filterName,
                })}`)
                    .setColor(client.color);
                return handler.editReply({
                    embeds: [filterInvalid],
                });
            }
            player === null || player === void 0 ? void 0 : player.data.set('filter-mode', filterName);
            player === null || player === void 0 ? void 0 : player.filter.set(filterName);
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'filter_on', {
                name: filterName,
            })}`)
                .setColor(client.color);
            yield handler.editReply({ content: ' ', embeds: [embed] });
        });
    }
}
