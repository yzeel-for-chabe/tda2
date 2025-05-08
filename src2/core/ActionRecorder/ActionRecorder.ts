

export interface UserAction_t {
    action: string;
    data: any;
    timestamp: number;

    text?: string;
}


export class ActionRecorder {
    private actions: UserAction_t[] = [];


    public recordAction(action: string, data: any, text?: string) {
        this.actions.push({
            action: action,
            data: data,
            timestamp: Date.now(),

            text: text
        });
    }

    constructor() {
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    public startRecording() {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mouseup", this.onMouseUp);
        // window.addEventListener("mousemove", this.onMouseMove);
    }

    public stopRecording() {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mouseup", this.onMouseUp);
        // window.removeEventListener("mousemove", this.onMouseMove);
    }

    onKeyDown(event: KeyboardEvent) {
        this.recordAction("keydown", {
            key: event.key,
            code: event.code
        }, event.target ? ( "(" + event.key + ")" + (event.target as any).innerText) : undefined);
    }

    onKeyUp(event: KeyboardEvent) {
        this.recordAction("keyup", {
            key: event.key,
            code: event.code
        }, event.target ? ( "(" + event.key + ")" + (event.target as any).innerText) : undefined);
    }

    onMouseDown(event: MouseEvent) {
        this.recordAction("mousedown", {
            button: event.button,
            x: event.clientX,
            y: event.clientY,
        }, event.target ? (event.target as any).innerText : undefined);
    }

    onMouseUp(event: MouseEvent) {
        this.recordAction("mouseup", {
            button: event.button,
            x: event.clientX,
            y: event.clientY
        }, event.target ? (event.target as any).innerText : undefined);
    }

    onMouseMove(event: MouseEvent) {
        this.recordAction("mousemove", {
            x: event.clientX,
            y: event.clientY,
        });
    }

    public getActions() {
        return this.actions;
    }

    public getHumanReadableActions() {
        return this.actions.map((action) => {
            return `${action.action} on ${action.text}`;
        });
    }

}
