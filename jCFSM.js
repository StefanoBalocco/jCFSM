export default class jCFSM {
    _inTransition = false;
    _currentState;
    _states = {};
    _transitions = {};
    constructor(initialState) {
        this.StateAdd(initialState);
        this._currentState = initialState;
    }
    StateAdd(state) {
        let returnValue = false;
        if (undefined === this._states[state]) {
            this._states[state] = {
                OnEnter: [],
                OnLeave: []
            };
            this._transitions[state] = {};
            returnValue = true;
        }
        return returnValue;
    }
    StateDel(state) {
        let returnValue = false;
        if (undefined !== this._states[state]) {
            delete (this._states[state]);
            if (undefined !== this._transitions[state]) {
                delete (this._transitions[state]);
            }
            const transitionKeys = Object.keys(this._transitions);
            const cL1 = transitionKeys.length;
            for (let iL1 = 0; iL1 < cL1; iL1++) {
                if (undefined !== this._transitions[transitionKeys[iL1]][state]) {
                    delete (this._transitions[transitionKeys[iL1]][state]);
                }
            }
            returnValue = true;
        }
        return returnValue;
    }
    StateOnEnterAdd(state, func) {
        let returnValue = false;
        if (undefined !== this._states[state]) {
            if (!this._states[state].OnEnter.includes(func)) {
                this._states[state].OnEnter.push(func);
                returnValue = true;
            }
        }
        return returnValue;
    }
    StateOnEnterDel(state, func) {
        let returnValue = false;
        if (undefined !== this._states[state]) {
            const pos = this._states[state].OnEnter.indexOf(func);
            if (-1 !== pos) {
                this._states[state].OnEnter.splice(pos, 1);
                returnValue = true;
            }
        }
        return returnValue;
    }
    StateOnLeaveAdd(state, func) {
        let returnValue = false;
        if (undefined !== this._states[state]) {
            if (!this._states[state].OnLeave.includes(func)) {
                this._states[state].OnLeave.push(func);
                returnValue = true;
            }
        }
        return returnValue;
    }
    StateOnLeaveDel(state, func) {
        let returnValue = false;
        if (undefined !== this._states[state]) {
            const pos = this._states[state].OnLeave.indexOf(func);
            if (-1 !== pos) {
                this._states[state].OnLeave.splice(pos, 1);
                returnValue = true;
            }
        }
        return returnValue;
    }
    TransitionAdd(from, to) {
        let returnValue = false;
        if ((undefined !== this._states[from]) && (undefined !== this._states[to])) {
            if (undefined === this._transitions[from][to]) {
                this._transitions[from][to] = {
                    OnBefore: [],
                    OnAfter: []
                };
                returnValue = true;
            }
        }
        return returnValue;
    }
    TransitionDel(from, to) {
        let returnValue = false;
        if ((undefined !== this._states[from]) && (undefined !== this._states[to])) {
            if (undefined !== this._transitions[from][to]) {
                delete (this._transitions[from][to]);
                returnValue = true;
            }
        }
        return returnValue;
    }
    TransitionOnBeforeAdd(from, to, func) {
        let returnValue = false;
        if ((undefined !== this._states[from]) && (undefined !== this._states[to])) {
            if (undefined !== this._transitions[from][to]) {
                this._transitions[from][to].OnBefore.push(func);
                returnValue = true;
            }
        }
        return returnValue;
    }
    TransitionOnBeforeDel(from, to, func) {
        let returnValue = false;
        if ((undefined !== this._states[from]) && (undefined !== this._states[to])) {
            if (undefined !== this._transitions[from][to]) {
                const pos = this._transitions[from][to].OnBefore.indexOf(func);
                if (-1 !== pos) {
                    this._transitions[from][to].OnBefore.splice(pos, 1);
                    returnValue = true;
                }
            }
        }
        return returnValue;
    }
    TransitionOnAfterAdd(from, to, func) {
        let returnValue = false;
        if ((undefined !== this._states[from]) && (undefined !== this._states[to])) {
            if (undefined !== this._transitions[from][to]) {
                this._transitions[from][to].OnAfter.push(func);
                returnValue = true;
            }
        }
        return returnValue;
    }
    TransitionOnAfterDel(from, to, func) {
        let returnValue = false;
        if ((undefined !== this._states[from]) && (undefined !== this._states[to])) {
            if (undefined !== this._transitions[from][to]) {
                const pos = this._transitions[from][to].OnAfter.indexOf(func);
                if (-1 !== pos) {
                    this._transitions[from][to].OnAfter.splice(pos, 1);
                    returnValue = true;
                }
            }
        }
        return returnValue;
    }
    StateGet() {
        return this._currentState;
    }
    async StateSet(nextState) {
        let returnValue = false;
        if (!this._inTransition) {
            this._inTransition = true;
            if (undefined !== this._states[nextState]) {
                if ((undefined !== this._transitions[this._currentState]) && (undefined !== this._transitions[this._currentState][nextState])) {
                    returnValue = true;
                    let cL1 = this._transitions[this._currentState][nextState].OnBefore.length;
                    for (let iL1 = 0; (returnValue && (iL1 < cL1)); iL1++) {
                        if ('function' === typeof (this._transitions[this._currentState][nextState].OnBefore[iL1])) {
                            returnValue = await this._transitions[this._currentState][nextState].OnBefore[iL1]();
                        }
                    }
                    if (returnValue) {
                        cL1 = this._states[this._currentState].OnLeave.length;
                        for (let iL1 = 0; iL1 < cL1; iL1++) {
                            if ('function' === typeof (this._states[this._currentState].OnLeave[iL1])) {
                                await this._states[this._currentState].OnLeave[iL1](this._currentState, nextState);
                            }
                        }
                        const previousState = this._currentState;
                        this._currentState = nextState;
                        cL1 = this._transitions[previousState][this._currentState].OnAfter.length;
                        for (let iL1 = 0; iL1 < cL1; iL1++) {
                            if ('function' === typeof (this._transitions[previousState][this._currentState].OnAfter[iL1])) {
                                await this._transitions[previousState][this._currentState].OnAfter[iL1]();
                            }
                        }
                        cL1 = this._states[this._currentState].OnEnter.length;
                        for (let iL1 = 0; iL1 < cL1; iL1++) {
                            if ('function' === typeof (this._states[this._currentState].OnEnter[iL1])) {
                                await this._states[this._currentState].OnEnter[iL1](this._currentState, previousState);
                            }
                        }
                    }
                }
            }
            this._inTransition = false;
        }
        return returnValue;
    }
}
