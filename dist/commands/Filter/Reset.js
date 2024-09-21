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
        this.name = ['reset'];
        this.description = 'Reset filter';
        this.category = 'Filter';
        this.accessableby = [Accessableby.Member];
        this.usage = '';
        this.aliases = ['reset'];
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
            if (!(player === null || player === void 0 ? void 0 : player.data.get('filter-mode')))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'reset_already')}`)
                            .setColor(client.color),
                    ],
                });
            player === null || player === void 0 ? void 0 : player.data.delete('filter-mode');
            yield (player === null || player === void 0 ? void 0 : player.filter.clear());
            yield (player === null || player === void 0 ? void 0 : player.setVolume(100));
            const resetted = new EmbedBuilder()
                .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'reset_on')}`)
                .setColor(client.color);
            yield handler.editReply({ content: ' ', embeds: [resetted] });
        });
    }
}
