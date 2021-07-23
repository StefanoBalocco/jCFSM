"use strict";
var jCFSM;
(function (jCFSM) {
    class StateMachine {
        constructor(initialState) {
            this._inTransition = false;
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
            if (!this._inTransition) {
                this._inTransition = true;
                if ('undefined' !== typeof (this._states[nextState])) {
                    if (('undefined' !== typeof (this._transitions[this._currentState])) && ('undefined' !== typeof (this._transitions[this._currentState][nextState]))) {
                        returnValue = true;
                        let countFL;
                        countFL = this._transitions[this._currentState][nextState].OnBefore.length;
                        for (let indexFL = 0; (returnValue && (indexFL < countFL)); indexFL++) {
                            if ('function' === typeof (this._transitions[this._currentState][nextState].OnBefore[indexFL])) {
                                let tmpValue = null;
                                if ('AsyncFunction' === this._transitions[this._currentState][nextState].OnBefore[indexFL].constructor.name) {
                                    tmpValue = await this._transitions[this._currentState][nextState].OnBefore[indexFL]();
                                }
                                else {
                                    tmpValue = this._transitions[this._currentState][nextState].OnBefore[indexFL]();
                                }
                                returnValue = (false !== tmpValue);
                            }
                        }
                        if (returnValue) {
                            countFL = this._states[this._currentState].OnLeave.length;
                            for (let indexFL = 0; indexFL < countFL; indexFL++) {
                                if ('function' === typeof (this._states[this._currentState].OnLeave[indexFL])) {
                                    if ('AsyncFunction' === this._states[this._currentState].OnLeave[indexFL].constructor.name) {
                                        await this._states[this._currentState].OnLeave[indexFL](this._currentState, nextState);
                                    }
                                    else {
                                        this._states[this._currentState].OnLeave[indexFL](this._currentState, nextState);
                                    }
                                }
                            }
                            let previousState = this._currentState;
                            this._currentState = nextState;
                            countFL = this._transitions[previousState][this._currentState].OnAfter.length;
                            for (let indexFL = 0; indexFL < countFL; indexFL++) {
                                if ('function' === typeof (this._transitions[previousState][this._currentState].OnAfter[indexFL])) {
                                    if ('AsyncFunction' === this._transitions[previousState][this._currentState].OnAfter[indexFL].constructor.name) {
                                        await this._transitions[previousState][this._currentState].OnAfter[indexFL]();
                                    }
                                    else {
                                        this._transitions[previousState][this._currentState].OnAfter[indexFL]();
                                    }
                                }
                            }
                            countFL = this._states[this._currentState].OnEnter.length;
                            for (let indexFL = 0; indexFL < countFL; indexFL++) {
                                if ('function' === typeof (this._states[this._currentState].OnEnter[indexFL])) {
                                    if ('AsyncFunction' === this._states[this._currentState].OnEnter[indexFL].constructor.name) {
                                        await this._states[this._currentState].OnEnter[indexFL](this._currentState, previousState);
                                    }
                                    else {
                                        this._states[this._currentState].OnEnter[indexFL](this._currentState, previousState);
                                    }
                                }
                            }
                        }
                    }
                }
                this._inTransition = false;
            }
            return (returnValue);
        }
    }
    function Create(initialState) {
        return new StateMachine(initialState);
    }
    jCFSM.Create = Create;
})(jCFSM || (jCFSM = {}));
if ('object' === typeof exports) {
    exports.Create = jCFSM.Create;
}
