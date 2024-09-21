var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var Accessableby;
(function (Accessableby) {
    Accessableby["Member"] = "Member";
    Accessableby["Owner"] = "Owner";
    Accessableby["Premium"] = "Premium";
    Accessableby["Manager"] = "Manager";
    Accessableby["Admin"] = "Admin";
    Accessableby["Voter"] = "Voter";
})(Accessableby || (Accessableby = {}));
export class Command {
    constructor() {
        this.name = [];
        this.description = "";
        this.category = "";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = [];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = false;
        this.sameVoiceCheck = false;
        this.options = [];
        this.permissions = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
