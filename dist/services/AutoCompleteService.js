var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class AutoCompleteService {
    constructor(client, interaction) {
        this.client = client;
        this.interaction = interaction;
        this.execute();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let guildModel = yield this.client.db.language.get(`${(_a = this.interaction.guild) === null || _a === void 0 ? void 0 : _a.id}`);
            if (!guildModel) {
                guildModel = yield this.client.db.language.set(`${(_b = this.interaction.guild) === null || _b === void 0 ? void 0 : _b.id}`, this.client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            let subCommandName = "";
            try {
                subCommandName = this.interaction.options.getSubcommand();
            }
            catch (_c) { }
            let subCommandGroupName;
            try {
                subCommandGroupName = this.interaction.options.getSubcommandGroup();
            }
            catch (_d) { }
            const commandNameArray = [];
            if (this.interaction.commandName)
                commandNameArray.push(this.interaction.commandName);
            if (subCommandName.length !== 0 && !subCommandGroupName)
                commandNameArray.push(subCommandName);
            if (subCommandGroupName) {
                commandNameArray.push(subCommandGroupName);
                commandNameArray.push(subCommandName);
            }
            const command = this.client.commands.get(commandNameArray.join("-"));
            if (!command)
                return commandNameArray.length == 0;
            try {
                command.autocomplete ? command.autocomplete(this.client, this.interaction, language) : true;
            }
            catch (error) {
                this.client.logger.error(import.meta.url, error);
            }
            return;
        });
    }
}
