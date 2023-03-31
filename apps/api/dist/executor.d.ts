declare class Executor {
    queue: any[];
    constructor();
    add(app: any): Promise<void>;
    start(): Promise<void>;
}
declare const executor: Executor;
export default executor;
