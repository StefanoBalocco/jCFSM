'use strict';
var jCFSM;
(function (jCFSM) {
    class StateMachine {
        constructor(initialState) {
            this._states = {};
            this._transitions = {};
            this.StateAdd(initialState);
            this._currentState = initialState;
        }
        StateAdd(state) {
            let returnValue = false;
            if ('undefined' === typeof (this._states[state])) {
                this._states[state] = {
                    OnEnter: [],
                    OnLeave: []
                };
                this._transitions[state] = {};
                returnValue = true;
            }
            return (returnValue);
        }
        StateDel(state) {
            let returnValue = false;
            if ('undefined' !== typeof (this._states[state])) {
                delete (this._states[state]);
                if ('undefined' !== typeof (this._transitions[state])) {
                    delete (this._transitions[state]);
                }
                for (const tmpState in this._transitions) {
                    if ('undefined' !== typeof (this._transitions[tmpState][state])) {
                        delete (this._transitions[tmpState][state]);
                    }
                }
                returnValue = true;
            }
            return (returnValue);
        }
        StateOnEnterAdd(state, func) {
            let returnValue = false;
            if ('undefined' !== typeof (this._states[state])) {
                if (!this._states[state].OnEnter.includes(func)) {
                    this._states[state].OnEnter.push(func);
                    returnValue = true;
                }
            }
            return (returnValue);
        }
        StateOnEnterDel(state, func) {
            let returnValue = false;
            if ('undefined' !== typeof (this._states[state])) {
                const pos = this._states[state].OnEnter.indexOf(func);
                if (-1 !== pos) {
                    this._states[state].OnEnter.splice(pos, 1);
                    returnValue = true;
                }
            }
            return (returnValue);
        }
        StateOnLeaveAdd(state, func) {
            let returnValue = false;
            if ('undefined' !== typeof (this._states[state])) {
                if (!this._states[state].OnLeave.includes(func)) {
                    this._states[state].OnLeave.push(func);
                    returnValue = true;
                }
            }
            return (returnValue);
        }
        StateOnLeaveDel(state, func) {
            let returnValue = false;
            if ('undefined' !== typeof (this._states[state])) {
                const pos = this._states[state].OnLeave.indexOf(func);
                if (-1 !== pos) {
                    this._states[state].OnLeave.splice(pos, 1);
                    returnValue = true;
                }
            }
            return (returnValue);
        }
        TransitionAdd(from, to) {
            let returnValue = false;
            if (('undefined' !== typeof (this._states[from])) && ('undefined' !== typeof (this._states[to]))) {
                if ('undefined' === typeof (this._transitions[from][to])) {
                    this._transitions[from][to] = {
                        OnBefore: [],
                        OnAfter: []
                    };
                    returnValue = true;
                }
            }
            return (returnValue);
        }
        TransitionDel(from, to) {
            let returnValue = false;
            if (('undefined' !== typeof (this._states[from])) && ('undefined' !== typeof (this._states[to]))) {
                if ('undefined' !== typeof (this._transitions[from][to])) {
                    delete (this._transitions[from][to]);
                    returnValue = true;
                }
            }
            return (returnValue);
        }
        TransitionOnBeforeAdd(from, to, func) {
            let returnValue = false;
            if (('undefined' !== typeof (this._states[from])) && ('undefined' !== typeof (this._states[to]))) {
                if ('undefined' !== typeof (this._transitions[from][to])) {
                    this._transitions[from][to].OnBefore.push(func);
                    returnValue = true;
                }
            }
            return (returnValue);
        }
        TransitionOnBeforeDel(from, to, func) {
            let returnValue = false;
            if (('undefined' !== typeof (this._states[from])) && ('undefined' !== typeof (this._states[to]))) {
                if ('undefined' !== typeof (this._transitions[from][to])) {
                    const pos = this._transitions[from][to].OnBefore.indexOf(func);
                    if (-1 !== pos) {
                        this._transitions[from][to].OnBefore.splice(pos, 1);
                        returnValue = true;
                    }
                }
            }
            return (returnValue);
        }
        TransitionOnAfterAdd(from, to, func) {
            let returnValue = false;
            if (('undefined' !== typeof (this._states[from])) && ('undefined' !== typeof (this._states[to]))) {
                if ('undefined' !== typeof (this._transitions[from][to])) {
                    this._transitions[from][to].OnAfter.push(func);
                    returnValue = true;
                }
            }
            return (returnValue);
        }
        TransitionOnAfterDel(from, to, func) {
            let returnValue = false;
            if (('undefined' !== typeof (this._states[from])) && ('undefined' !== typeof (this._states[to]))) {
                if ('undefined' !== typeof (this._transitions[from][to])) {
                    const pos = this._transitions[from][to].OnAfter.indexOf(func);
                    if (-1 !== pos) {
                        this._transitions[from][to].OnAfter.splice(pos, 1);
                        returnValue = true;
                    }
                }
            }
            return (returnValue);
        }
        StateGet() {
            return (this._currentState);
        }
        async StateSet(nextState) {
            let returnValue = false;
            if ('undefined' !== typeof (this._states[nextState])) {
                if (('undefined' !== typeof (this._transitions[this._currentState])) && ('undefined' !== typeof (this._transitions[this._currentState][nextState]))) {
                    returnValue = true;
                    let countFirstLevel;
                    countFirstLevel = this._states[this._currentState].OnLeave.length;
                    for (let indexFirstLevel = 0; indexFirstLevel < countFirstLevel; indexFirstLevel++) {
                        if ('function' === typeof (this._states[this._currentState].OnLeave[indexFirstLevel])) {
                            if ('AsyncFunction' === this._states[this._currentState].OnLeave[indexFirstLevel].constructor.name) {
                                await this._states[this._currentState].OnLeave[indexFirstLevel](this._currentState, nextState);
                            }
                            else {
                                this._states[this._currentState].OnLeave[indexFirstLevel](this._currentState, nextState);
                            }
                        }
                    }
                    countFirstLevel = this._transitions[this._currentState][nextState].OnBefore.length;
                    for (let indexFirstLevel = 0; indexFirstLevel < countFirstLevel; indexFirstLevel++) {
                        if ('function' === typeof (this._transitions[this._currentState][nextState].OnBefore[indexFirstLevel])) {
                            if ('AsyncFunction' === this._transitions[this._currentState][nextState].OnBefore[indexFirstLevel].constructor.name) {
                                await this._transitions[this._currentState][nextState].OnBefore[indexFirstLevel]();
                            }
                            else {
                                this._transitions[this._currentState][nextState].OnBefore[indexFirstLevel]();
                            }
                        }
                    }
                    let previousState = this._currentState;
                    this._currentState = nextState;
                    countFirstLevel = this._transitions[previousState][this._currentState].OnAfter.length;
                    for (let indexFirstLevel = 0; indexFirstLevel < countFirstLevel; indexFirstLevel++) {
                        if ('function' === typeof (this._transitions[previousState][this._currentState].OnAfter[indexFirstLevel])) {
                            if ('AsyncFunction' === this._transitions[previousState][this._currentState].OnAfter[indexFirstLevel].constructor.name) {
                                await this._transitions[previousState][this._currentState].OnAfter[indexFirstLevel]();
                            }
                            else {
                                this._transitions[previousState][this._currentState].OnAfter[indexFirstLevel]();
                            }
                        }
                    }
                    countFirstLevel = this._states[this._currentState].OnEnter.length;
                    for (let indexFirstLevel = 0; indexFirstLevel < countFirstLevel; indexFirstLevel++) {
                        if ('function' === typeof (this._states[this._currentState].OnEnter[indexFirstLevel])) {
                            if ('AsyncFunction' === this._states[this._currentState].OnEnter[indexFirstLevel].constructor.name) {
                                await this._states[this._currentState].OnEnter[indexFirstLevel](this._currentState, previousState);
                            }
                            else {
                                this._states[this._currentState].OnEnter[indexFirstLevel](this._currentState, previousState);
                            }
                        }
                    }
                }
            }
            return (returnValue);
        }
    }
    function Create(initialState) {
        return new StateMachine(initialState);
    }
    jCFSM.Create = Create;
})(jCFSM || (jCFSM = {}));
if ('object' === typeof (exports)) {
    exports.Create = jCFSM.Create;
}
