var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import cron from "node-cron";
import { TopggService } from "../../services/TopggService.js";
export default class {
    execute(client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            client.logger.info(import.meta.url, `Logged in ${client.user.tag}`);
            cron.schedule("0 */1 * * * *", () => {
                client.user.setPresence({
                    activities: [
                        {
                            name: `v${client.metadata.version} | /play`,
                            type: 2,
                        },
                    ],
                    status: "online",
                });
            });
            if (client.config.features.TOPGG_TOKEN && client.config.features.TOPGG_TOKEN.length !== 0) {
                const topgg = new TopggService(client);
                const res = yield topgg.settingUp(String((_a = client.user) === null || _a === void 0 ? void 0 : _a.id));
                if (res) {
                    client.topgg = topgg;
                    client.topgg.startInterval();
                }
            }
        });
    }
}
