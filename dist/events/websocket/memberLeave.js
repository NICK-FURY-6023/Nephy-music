var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class {
    execute(client, oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (newState.channel === null && newState.id !== client.user.id)
                (_a = client.wsl.get(oldState.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                    op: "memberLeave",
                    guild: oldState.guild.id,
                    userId: (_b = oldState.member) === null || _b === void 0 ? void 0 : _b.id,
                });
        });
    }
}
