
export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

export const RetryHelperFx = {
    ReloadPage: async (f: RetryCbParam) => {
        f.considerFailed = true;
        window.location.reload();
        await wait(2000);
    }
}

class RetryPersistency {
    public static Get(name: string): number {
        const itemstr = window.localStorage.getItem(name);
        if(itemstr == null) return 0;
        return Number.parseInt(itemstr);
    }
    public static Set(name: string, stepToTry: number) {
        window.localStorage.setItem(name, ""+stepToTry)
    }
    public static Clear(name: string) {
        RetryPersistency.Set(name, 0);
    }
}

export type RetryCbParam = {
    considerFailed: boolean
}

export type RetryCbFx<ResultT> = (p: RetryCbParam) => ResultT | Promise<ResultT>;

export class Retry<ResultT> {

    private name: string;
    private step: number;
    private handlers: RetryCbFx<ResultT>[] = []

    private LoopCheckAndRestart() {
        console.log("Starting loop");
        const iv = setInterval(() => {
            if(this.handlers.length >= this.step) {
                console.log("ok")
                clearInterval(iv);
                this.run()
            }
        }, 100);
    }

    public constructor(name: string) {


        this.name = name;
        this.step = RetryPersistency.Get(name);


        if(this.step != 0) {
            console.log("Restarting from method=" + this.step);
            this.LoopCheckAndRestart()
        } 
    }

    public add(handler: RetryCbFx<ResultT>) {
        console.log("Added handler, len=" + this.handlers.length);
        this.handlers.push(handler);
        return this;
    }
    

    public async run(): Promise<ResultT> {

        console.log("Run!")
        for(let i = this.step ; i <= this.handlers.length ; ++i) {

            RetryPersistency.Set(this.name, ++this.step)
            console.log("In loop " + i)

            try {
                const p = { considerFailed: false };
                const result = await this.handlers[i](p)

                if(p.considerFailed) throw "";

                RetryPersistency.Clear(this.name);
                return result;
            } catch (e: unknown) {
                console.log(`Method ${i} failed.`);
                console.log(RetryPersistency.Get(this.name))
            }

        }

RetryPersistency.Clear(this.name);
        throw new Error("Unable to find a working method for the function.");

    }
    
}
