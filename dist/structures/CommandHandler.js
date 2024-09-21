var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var ParseMentionEnum;
(function (ParseMentionEnum) {
    ParseMentionEnum[ParseMentionEnum["ERROR"] = 0] = "ERROR";
    ParseMentionEnum[ParseMentionEnum["USER"] = 1] = "USER";
    ParseMentionEnum[ParseMentionEnum["ROLE"] = 2] = "ROLE";
    ParseMentionEnum[ParseMentionEnum["EVERYONE"] = 3] = "EVERYONE";
    ParseMentionEnum[ParseMentionEnum["CHANNEL"] = 4] = "CHANNEL";
})(ParseMentionEnum || (ParseMentionEnum = {}));
export class CommandHandler {
    constructor(options) {
        this.attactments = [];
        this.USERS_PATTERN = /<@!?(\d{17,19})>/;
        this.ROLES_PATTERN = /<@&(\d{17,19})>/;
        this.CHANNELS_PATTERN = /<#(\d{17,19})>/;
        this.EVERYONE_PATTERN = /@(everyone|here)/;
        this.client = options.client;
        this.interaction = options.interaction;
        this.message = options.message;
        this.language = options.language;
        this.guild = this.guildData;
        this.user = this.userData;
        this.member = this.memberData;
        this.args = options.args;
        this.createdAt = this.createdStimeStampData;
        this.prefix = options.prefix;
        this.channel = this.channelData;
        this.modeLang = this.modeLangData;
    }
    get userData() {
        var _a;
        if (this.interaction) {
            return this.interaction.user;
        }
        else {
            return (_a = this.message) === null || _a === void 0 ? void 0 : _a.author;
        }
    }
    get modeLangData() {
        return {
            enable: `${this.client.getString(this.language, "global", "enable")}`,
            disable: `${this.client.getString(this.language, "global", "disable")}`,
        };
    }
    get guildData() {
        var _a;
        if (this.interaction) {
            return this.interaction.guild;
        }
        else {
            return (_a = this.message) === null || _a === void 0 ? void 0 : _a.guild;
        }
    }
    get memberData() {
        var _a;
        if (this.interaction) {
            return this.interaction.member;
        }
        else {
            return (_a = this.message) === null || _a === void 0 ? void 0 : _a.member;
        }
    }
    get createdStimeStampData() {
        var _a;
        if (this.interaction) {
            return Number(this.interaction.createdTimestamp);
        }
        else {
            return Number((_a = this.message) === null || _a === void 0 ? void 0 : _a.createdTimestamp);
        }
    }
    get channelData() {
        var _a;
        if (this.interaction) {
            return this.interaction.channel;
        }
        else {
            return (_a = this.message) === null || _a === void 0 ? void 0 : _a.channel;
        }
    }
    sendMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.interaction) {
                return yield this.interaction.reply(data);
            }
            else {
                return yield ((_a = this.message) === null || _a === void 0 ? void 0 : _a.reply(data));
            }
        });
    }
    followUp(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.interaction) {
                return yield this.interaction.followUp(data);
            }
            else {
                return yield ((_a = this.message) === null || _a === void 0 ? void 0 : _a.reply(data));
            }
        });
    }
    deferReply() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (this.interaction) {
                const data = yield this.interaction.deferReply({ ephemeral: false });
                return (this.msg = data);
            }
            else {
                const data = yield ((_a = this.message) === null || _a === void 0 ? void 0 : _a.reply(`**${(_b = this.client.user) === null || _b === void 0 ? void 0 : _b.username}** is thinking...`));
                return (this.msg = data);
            }
        });
    }
    editReply(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.msg) {
                this.client.logger.error(import.meta.url, "You have not declared deferReply()");
                return;
            }
            if (this.interaction) {
                return this.msg.edit(data);
            }
            else {
                if (data.embeds && !data.content)
                    return this.msg.edit({
                        content: "",
                        embeds: data.embeds,
                        components: data.components,
                        allowedMentions: data.allowedMentions,
                    });
                else
                    return this.msg.edit(data);
            }
        });
    }
    parseMentions(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (this.USERS_PATTERN.test(data)) {
                const extract = this.USERS_PATTERN.exec(data);
                const user = yield this.client.users.fetch(extract[1]).catch(() => undefined);
                if (!user || user == null)
                    return {
                        type: ParseMentionEnum.ERROR,
                        data: "error",
                    };
                return {
                    type: ParseMentionEnum.USER,
                    data: user,
                };
            }
            if (this.CHANNELS_PATTERN.test(data)) {
                const extract = this.CHANNELS_PATTERN.exec(data);
                const channel = yield this.client.channels.fetch(extract[1]).catch(() => undefined);
                if (!channel || channel == null)
                    return {
                        type: ParseMentionEnum.ERROR,
                        data: "error",
                    };
                return {
                    type: ParseMentionEnum.CHANNEL,
                    data: channel,
                };
            }
            if (this.ROLES_PATTERN.test(data)) {
                const extract = this.ROLES_PATTERN.exec(data);
                const role = this.message
                    ? yield ((_a = this.message.guild) === null || _a === void 0 ? void 0 : _a.roles.fetch(extract[1]).catch(() => undefined))
                    : yield ((_c = (_b = this.interaction) === null || _b === void 0 ? void 0 : _b.guild) === null || _c === void 0 ? void 0 : _c.roles.fetch(extract[1]).catch(() => undefined));
                if (!role || role == null)
                    return {
                        type: ParseMentionEnum.ERROR,
                        data: "error",
                    };
                return {
                    type: ParseMentionEnum.ROLE,
                    data: role,
                };
            }
            if (this.EVERYONE_PATTERN.test(data)) {
                return {
                    type: ParseMentionEnum.EVERYONE,
                    data: true,
                };
            }
            return {
                type: ParseMentionEnum.ERROR,
                data: "error",
            };
        });
    }
    addAttachment(data) {
        return this.attactments.push(...data.map((data) => {
            return data;
        }));
    }
}
