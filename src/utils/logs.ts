import Dates from "./dates";

const date: Dates = new Dates();

export default class Logs {
    private static readonly _colours = {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m",

        fg: {
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            crimson: "\x1b[38m"
        },
        bg: {
            black: "\x1b[40m",
            red: "\x1b[41m",
            green: "\x1b[42m",
            yellow: "\x1b[43m",
            blue: "\x1b[44m",
            magenta: "\x1b[45m",
            cyan: "\x1b[46m",
            white: "\x1b[47m",
            crimson: "\x1b[48m"
        }
    };

    public static info(message: any) {

        let title: string = "INFO";
        title = `${this._colours.fg.white}[${this._colours.fg.green}${title}${this._colours.fg.white}]${this._colours.reset}`;
        let time = date.fullYearTime();
        time = `${this._colours.fg.white}[${this._colours.fg.cyan}${date.fullYearTime()}${this._colours.fg.white}]${this._colours.reset}`;

        console.log(`${time}${title}`, message);
    }

    public static warn(message: any) {

        let title: string = "WARN";
        title = `${this._colours.fg.white}[${this._colours.fg.yellow}${title}${this._colours.fg.white}]${this._colours.reset}`;
        let time = date.fullYearTime();
        time = `${this._colours.fg.white}[${this._colours.fg.cyan}${date.fullYearTime()}${this._colours.fg.white}]${this._colours.reset}`;

        console.log(`${time}${title}`, message);
    }

    public static error(message: any) {

        let title: string = "ERROR";
        title = `${this._colours.fg.white}[${this._colours.fg.red}${title}${this._colours.fg.white}]${this._colours.reset}`;
        let time = date.fullYearTime();
        time = `${this._colours.fg.white}[${this._colours.fg.cyan}${date.fullYearTime()}${this._colours.fg.white}]${this._colours.reset}`;

        console.log(`${time}${title}`, message);
    }

    // writeLogFile(logText: string) {

    // }
}
