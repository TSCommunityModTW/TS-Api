import { Socket } from "socket.io";
import Logs from "../../utils/logs";

export interface IEventType {
    LAUNCHET_SERVER_FILE: [any]
}

export interface ISocketEvent<Key extends keyof IEventType> {
    event: keyof IEventType;
    execute(socket: Socket, ...args: IEventType[Key]): void;
}

export default class SocketEvent {

    private _socket: Socket;

    constructor(socket: Socket) {
        this._socket = socket;
    }

    public register(events: Array<ISocketEvent<keyof IEventType>>) {
        events.forEach((eventClass) => {
            Logs.info(`Register event ${eventClass.event} success.`);
            this._socket.on(eventClass.event, (...args: IEventType[typeof eventClass.event]) => eventClass.execute(this._socket, ...args));
        });
    }
}