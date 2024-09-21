/**
 * Lavalink events enum
 */
export var LavalinkEventsEnum;
(function (LavalinkEventsEnum) {
    LavalinkEventsEnum["Ready"] = "ready";
    LavalinkEventsEnum["Status"] = "stats";
    LavalinkEventsEnum["Event"] = "event";
    LavalinkEventsEnum["PlayerUpdate"] = "playerUpdate";
})(LavalinkEventsEnum || (LavalinkEventsEnum = {}));
/**
 * Lavalink player events enum
 */
export var LavalinkPlayerEventsEnum;
(function (LavalinkPlayerEventsEnum) {
    LavalinkPlayerEventsEnum["TrackStartEvent"] = "TrackStartEvent";
    LavalinkPlayerEventsEnum["TrackEndEvent"] = "TrackEndEvent";
    LavalinkPlayerEventsEnum["TrackExceptionEvent"] = "TrackExceptionEvent";
    LavalinkPlayerEventsEnum["TrackStuckEvent"] = "TrackStuckEvent";
    LavalinkPlayerEventsEnum["WebSocketClosedEvent"] = "WebSocketClosedEvent";
})(LavalinkPlayerEventsEnum || (LavalinkPlayerEventsEnum = {}));
