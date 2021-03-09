declare namespace jCFSM {
    export type FunctionOnEnter = (currentState: string, nextState: string) => (void | Promise<void>);
    export type FunctionOnLeave = (currentState: string, prevState: string) => (void | Promise<void>);
    export type FunctionOnTransition = () => (void | Promise<void>);
    class StateMachine {
        private _currentState;
        private _states;
        private _transitions;
        constructor(initialState: string);
        StateAdd(state: string): boolean;
        StateDel(state: string): boolean;
        StateOnEnterAdd(state: string, func: FunctionOnEnter): boolean;
        StateOnEnterDel(state: string, func: FunctionOnEnter): boolean;
        StateOnLeaveAdd(state: string, func: FunctionOnLeave): boolean;
        StateOnLeaveDel(state: string, func: FunctionOnLeave): boolean;
        TransitionAdd(from: string, to: string): boolean;
        TransitionDel(from: string, to: string): boolean;
        TransitionOnBeforeAdd(from: string, to: string, func: FunctionOnTransition): boolean;
        TransitionOnBeforeDel(from: string, to: string, func: FunctionOnTransition): boolean;
        TransitionOnAfterAdd(from: string, to: string, func: FunctionOnTransition): boolean;
        TransitionOnAfterDel(from: string, to: string, func: FunctionOnTransition): boolean;
        StateGet(): string;
        StateSet(nextState: string): Promise<boolean>;
    }
    export function Create(initialState: string): StateMachine;
    export {};
}
