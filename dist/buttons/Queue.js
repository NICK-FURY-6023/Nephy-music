var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, } from 'discord.js';
import { formatDuration } from '../utilities/FormatDuration.js';
import { getTitle } from '../utilities/GetTitle.js';
export default class {
    constructor() {
        this.name = 'queue';
    }
    run(client, message, language, player, nplaying, collector) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!player) {
                collector.stop();
            }
            const song = player.queue.current;
            const qduration = `${formatDuration(song.duration + player.queue.duration)}`;
            const thumbnail = (_a = song === null || song === void 0 ? void 0 : song.artworkUrl) !== null && _a !== void 0 ? _a : `https://img.youtube.com/vi/${song.identifier}/hqdefault.jpg`;
            let pagesNum = Math.ceil(player.queue.length / 10);
            if (pagesNum === 0)
                pagesNum = 1;
            const songStrings = [];
            for (let i = 0; i < player.queue.length; i++) {
                const song = player.queue[i];
                songStrings.push(`**${i + 1}.** ${getTitle(client, song)} \`[${formatDuration(song.duration)}]\`
        `);
            }
            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = songStrings.slice(i * 10, i * 10 + 10).join('');
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.i18n.get(language, 'button.music', 'queue_author', {
                        guild: message.guild.name,
                    })}`,
                })
                    .setThumbnail(thumbnail)
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(language, 'button.music', 'queue_description', {
                    track: getTitle(client, song),
                    duration: formatDuration(song === null || song === void 0 ? void 0 : song.duration),
                    requester: `${song.requester}`,
                    list_song: str == '' ? '  Nothing' : '\n' + str,
                })}`)
                    .setFooter({
                    text: `${client.i18n.get(language, 'button.music', 'queue_footer', {
                        page: `${i + 1}`,
                        pages: `${pagesNum}`,
                        queue_lang: `${player.queue.length}`,
                        total_duration: qduration,
                    })}`,
                });
                pages.push(embed);
            }
            message.reply({ embeds: [pages[0]], ephemeral: true });
        });
    }
}
