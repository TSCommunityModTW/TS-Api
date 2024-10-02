import { Socket } from "socket.io";
import { IEventType, ISocketEvent } from "./SocketEvent";
import { Homemade } from "../../lib/ModpackTools";

export default class LauncherServerFile implements ISocketEvent<"LAUNCHET_SERVER_FILE"> {

    public event: keyof IEventType = "LAUNCHET_SERVER_FILE";

    public execute(socket: Socket, data: IParameter): void {

        if (data.run === "Analyze_upload") {

            switch (data.getType) {
                case "Homemade":
                    if (!data.newVersion || !data.newName) return; // TODO:
                    new Homemade(socket, data.newName, data.newVersion).handle(data.downloadUrl);
                    break;
            }

        }

    }
}

interface IParameter {
    run: "Analyze_upload";
    getType: "Homemade";
    newName?: string;
    newVersion?: string;
    downloadUrl: string;
}