// Copyright (c) <current_year>, The PerformanC Organization
// This is the modded version of PWSL (typescript variant) for running on Rainlink
// Source code get from PerformanC/Internals#PWSL
// Special thanks to all members of PerformanC Organization
// Link: https://github.com/PerformanC/internals/tree/fbc73f6368a6971835683f4b22bb4e3b15fa0b73
// Github repo link: https://github.com/PerformanC/internals
// PWSL's LICENSE: https://github.com/PerformanC/internals/blob/fbc73f6368a6971835683f4b22bb4e3b15fa0b73/LICENSE
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import https from "node:https";
import http from "node:http";
import crypto from "node:crypto";
import EventEmitter from "node:events";
import { URL } from "node:url";
export var RainlinkWebsocketState;
(function (RainlinkWebsocketState) {
    RainlinkWebsocketState["WAITING"] = "WAITING";
    RainlinkWebsocketState["PROCESSING"] = "PROCESSING";
})(RainlinkWebsocketState || (RainlinkWebsocketState = {}));
function parseFrameHeaderInfo(buffer) {
    let startIndex = 2;
    const opcode = buffer[0] & 15;
    const fin = (buffer[0] & 128) === 128;
    let payloadLength = buffer[1] & 127;
    let mask = null;
    if ((buffer[1] & 128) === 128) {
        mask = buffer.subarray(startIndex, startIndex + 4);
        startIndex += 4;
    }
    if (payloadLength === 126) {
        startIndex += 2;
        payloadLength = buffer.readUInt16BE(2);
    }
    else if (payloadLength === 127) {
        startIndex += 8;
        payloadLength = buffer.readUIntBE(4, 8);
    }
    return {
        opcode,
        fin,
        payloadLength,
        mask,
        startIndex,
    };
}
function parseFrameHeader(info, buffer) {
    const slicedBuffer = buffer.subarray(info.startIndex, info.startIndex + info.payloadLength);
    if (info.mask) {
        for (let i = 0; i < info.payloadLength; i++) {
            slicedBuffer[i] = slicedBuffer[i] ^ info.mask[i & 3];
        }
    }
    return {
        opcode: info.opcode,
        fin: info.fin,
        buffer: slicedBuffer,
        payloadLength: info.payloadLength,
        rest: buffer.subarray(info.startIndex + info.payloadLength),
    };
}
export class RainlinkWebsocket extends EventEmitter {
    /**
     * Modded version of PWSL class
     * @param url The WS url have to connect
     * @param options Some additional options of PWSL
     * @instance
     */
    constructor(url, options) {
        super();
        this.url = url;
        this.options = options;
        this.socket = null;
        this.continueInfo = {
            type: -1,
            buffer: [],
        };
        this.state = RainlinkWebsocketState.WAITING;
        this.connect();
        return this;
    }
    /**
     * Connect to current websocket link
     * @instance
     */
    connect() {
        var _a, _b, _c;
        const parsedUrl = new URL(this.url);
        const isSecure = parsedUrl.protocol === "wss:";
        const agent = isSecure ? https : http;
        const key = crypto.randomBytes(16).toString("base64");
        const request = agent.request((isSecure ? "https://" : "http://") +
            parsedUrl.hostname +
            parsedUrl.pathname +
            parsedUrl.search, {
            port: parsedUrl.port || (isSecure ? 443 : 80),
            timeout: (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.timeout) !== null && _b !== void 0 ? _b : 0,
            headers: Object.assign({ "Sec-WebSocket-Key": key, "Sec-WebSocket-Version": 13, Upgrade: "websocket", Connection: "Upgrade" }, (((_c = this.options) === null || _c === void 0 ? void 0 : _c.headers) || {})),
            method: "GET",
        });
        request.on("error", (err) => {
            this.emit("error", err);
            this.emit("close");
            this.cleanup();
        });
        request.on("upgrade", (res, socket, head) => {
            var _a;
            socket.setNoDelay();
            socket.setKeepAlive(true);
            if (head.length !== 0)
                socket.unshift(head);
            if (((_a = res.headers.upgrade) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== "websocket") {
                socket.destroy();
                return;
            }
            const digest = crypto
                .createHash("sha1")
                .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
                .digest("base64");
            if (res.headers["sec-websocket-accept"] !== digest) {
                socket.destroy();
                return;
            }
            socket.once("readable", () => this.checkData());
            socket.on("close", () => {
                this.emit("close");
                this.cleanup();
            });
            socket.on("error", (err) => {
                this.emit("error", err);
                this.emit("close");
                this.cleanup();
            });
            this.socket = socket;
            this.emit("open", socket, res.headers);
        });
        request.end();
    }
    checkData() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const data = (_a = this.socket) === null || _a === void 0 ? void 0 : _a.read();
            if (data && this.state === "WAITING") {
                this.state = RainlinkWebsocketState.PROCESSING;
                yield this._processData(data);
                this.state = RainlinkWebsocketState.WAITING;
            }
            (_b = this.socket) === null || _b === void 0 ? void 0 : _b.once("readable", () => this.checkData());
        });
    }
    _processData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const info = parseFrameHeaderInfo(data);
            const bodyLength = Buffer.byteLength(data) - info.startIndex;
            if (info.payloadLength > bodyLength) {
                const bytesLeft = info.payloadLength - bodyLength;
                const nextData = yield new Promise((resolve) => {
                    var _a;
                    (_a = this.socket) === null || _a === void 0 ? void 0 : _a.once("data", (data) => {
                        var _a;
                        if (data.length > bytesLeft) {
                            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.unshift(data.subarray(bytesLeft));
                            data = data.subarray(0, bytesLeft);
                        }
                        resolve(data);
                    });
                });
                data = Buffer.concat([data, nextData]);
            }
            const headers = parseFrameHeader(info, data);
            switch (headers.opcode) {
                case 0x0: {
                    this.continueInfo.buffer.push(headers.buffer);
                    if (headers.fin) {
                        this.emit("message", this.continueInfo.type === 1
                            ? this.continueInfo.buffer.join("")
                            : Buffer.concat(this.continueInfo.buffer));
                        this.continueInfo = {
                            type: -1,
                            buffer: [],
                        };
                    }
                    break;
                }
                case 0x1:
                case 0x2: {
                    if (this.continueInfo.type !== -1 && this.continueInfo.type !== headers.opcode) {
                        this.close(1002, "Invalid continuation frame");
                        this.cleanup();
                        return;
                    }
                    if (!headers.fin) {
                        this.continueInfo.type = headers.opcode;
                        this.continueInfo.buffer.push(headers.buffer);
                    }
                    else {
                        this.emit("message", headers.opcode === 0x1 ? headers.buffer.toString("utf8") : headers.buffer);
                    }
                    break;
                }
                case 0x8: {
                    if (headers.buffer.length === 0) {
                        this.emit("close", 1006, "");
                    }
                    else {
                        const code = headers.buffer.readUInt16BE(0);
                        const reason = headers.buffer.subarray(2).toString("utf-8");
                        this.emit("close", code, reason);
                    }
                    this.cleanup();
                    break;
                }
                case 0x9: {
                    const pong = Buffer.allocUnsafe(2);
                    pong[0] = 0x8a;
                    pong[1] = 0x00;
                    (_a = this.socket) === null || _a === void 0 ? void 0 : _a.write(pong);
                    break;
                }
                case 0xa: {
                    this.emit("pong");
                }
                // eslint-disable-next-line no-fallthrough
                default: {
                    this.close(1002, "Invalid opcode");
                    this.cleanup();
                    return;
                }
            }
            if (headers.rest.length > 0)
                (_b = this.socket) === null || _b === void 0 ? void 0 : _b.unshift(headers.rest);
        });
    }
    /**
     * Clean up all current websocket state
     * @returns boolean
     */
    cleanup() {
        if (this.socket) {
            this.socket.destroy();
            this.socket = null;
        }
        this.continueInfo = {
            type: -1,
            buffer: [],
        };
        return true;
    }
    /**
     * Send raw buffer data to ws server
     * @returns boolean
     */
    sendData(data, options) {
        var _a;
        let payloadStartIndex = 2;
        let payloadLength = options.len;
        let mask = null;
        if (options.mask) {
            mask = Buffer.allocUnsafe(4);
            while ((mask[0] | mask[1] | mask[2] | mask[3]) === 0)
                crypto.randomFillSync(mask, 0, 4);
            payloadStartIndex += 4;
        }
        if (options.len >= 65536) {
            payloadStartIndex += 8;
            payloadLength = 127;
        }
        else if (options.len > 125) {
            payloadStartIndex += 2;
            payloadLength = 126;
        }
        const header = Buffer.allocUnsafe(payloadStartIndex);
        header[0] = options.fin ? options.opcode | 128 : options.opcode;
        header[1] = payloadLength;
        if (payloadLength === 126) {
            header.writeUInt16BE(options.len, 2);
        }
        else if (payloadLength === 127) {
            header.writeUIntBE(options.len, 2, 6);
        }
        if (options.mask) {
            header[1] |= 128;
            header[payloadStartIndex - 4] = mask[0];
            header[payloadStartIndex - 3] = mask[1];
            header[payloadStartIndex - 2] = mask[2];
            header[payloadStartIndex - 1] = mask[3];
            for (let i = 0; i < options.len; i++) {
                data[i] = data[i] ^ mask[i & 3];
            }
        }
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.write(Buffer.concat([header, data]));
        return true;
    }
    /**
     * Send string data to ws server
     * @returns boolean
     */
    send(data) {
        const payload = Buffer.from(data, "utf-8");
        return this.sendData(payload, { len: payload.length, fin: true, opcode: 0x01, mask: true });
    }
    /**
     * Close the connection of tthe current ws server
     * @returns boolean
     */
    close(code, reason) {
        const data = Buffer.allocUnsafe(2 + Buffer.byteLength(reason !== null && reason !== void 0 ? reason : "normal close"));
        data.writeUInt16BE(code !== null && code !== void 0 ? code : 1000);
        data.write(reason !== null && reason !== void 0 ? reason : "normal close", 2);
        this.sendData(data, { len: data.length, fin: true, opcode: 0x8 });
        return true;
    }
}
