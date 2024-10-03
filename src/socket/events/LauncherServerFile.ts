import { Socket } from "socket.io";
import { IEventType, ISocketEvent } from "./SocketEvent";
import { Homemade } from "../../lib/ModpackTools";

export default class LauncherServerFile implements ISocketEvent<"LAUNCHET_SERVER_FILE"> {

    public event: keyof IEventType = "LAUNCHET_SERVER_FILE";

    public async execute(socket: Socket, data: IParameter) {
        try {

            if (data.run === "Analyze_upload") {

                switch (data.getType) {
                    case "Homemade":
                        if (!data.newVersion || !data.newName) return; // TODO:
                        await new Homemade(socket, data.newName, data.newVersion).handle(data.downloadUrl);
                        break;
                }

            }

        } catch (error: any) {
            socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "ERROR", messages: error.error_description });
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