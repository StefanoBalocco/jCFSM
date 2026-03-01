type Promisable<T> = T | Promise<T>;

export type FunctionOnEnter = ( currentState: string, prevState: string ) => Promisable<void>;
export type FunctionOnLeave = ( currentState: string, nextState: string ) => Promisable<void>;
export type FunctionOnTransitionAfter = () => Promisable<void>;
export type FunctionOnTransitionBefore = () => Promisable<boolean>;

export default class jCFSM {
	private _inTransition: boolean = false;
	private _currentState: string;
	private _states: { [ key: string ]: { OnEnter: FunctionOnEnter[], OnLeave: FunctionOnLeave[] } } = {};
	private _transitions: { [ key: string ]: { [ key: string ]: { OnBefore: FunctionOnTransitionBefore[], OnAfter: FunctionOnTransitionAfter[] } } } = {};

	constructor( initialState: string ) {
		this.StateAdd( initialState );
		this._currentState = initialState;
	}

	public StateAdd( state: string ): boolean {
		let returnValue: boolean = false;
		if( undefined === this._states[ state ] ) {
			this._states[ state ] = {
				OnEnter: [],
				OnLeave: []
			};
			this._transitions[ state ] = {};
			returnValue = true;
		}
		return returnValue;
	}

	public StateDel( state: string ): boolean {
		let returnValue: boolean = false;
		if( undefined !== this._states[ state ] ) {
			delete ( this._states[ state ] );
			if( undefined !== this._transitions[ state ] ) {
				delete ( this._transitions[ state ] );
			}
			const transitionKeys: string[] = Object.keys( this._transitions );
			const cL1: number = transitionKeys.length;
			for( let iL1: number = 0; iL1 < cL1; iL1++ ) {
				if( undefined !== this._transitions[ transitionKeys[ iL1 ] ][ state ] ) {
					delete ( this._transitions[ transitionKeys[ iL1 ] ][ state ] );
				}
			}
			returnValue = true;
		}
		return returnValue;
	}

	public StateOnEnterAdd( state: string, func: FunctionOnEnter ): boolean {
		let returnValue: boolean = false;
		if( undefined !== this._states[ state ] ) {
			if( !this._states[ state ].OnEnter.includes( func ) ) {
				this._states[ state ].OnEnter.push( func );
				returnValue = true;
			}
		}
		return returnValue;
	}

	public StateOnEnterDel( state: string, func: FunctionOnEnter ): boolean {
		let returnValue: boolean = false;
		if( undefined !== this._states[ state ] ) {
			const pos: number = this._states[ state ].OnEnter.indexOf( func );
			if( -1 !== pos ) {
				this._states[ state ].OnEnter.splice( pos, 1 );
				returnValue = true;
			}
		}
		return returnValue;
	}

	public StateOnLeaveAdd( state: string, func: FunctionOnLeave ): boolean {
		let returnValue: boolean = false;
		if( undefined !== this._states[ state ] ) {
			if( !this._states[ state ].OnLeave.includes( func ) ) {
				this._states[ state ].OnLeave.push( func );
				returnValue = true;
			}
		}
		return returnValue;
	}

	public StateOnLeaveDel( state: string, func: FunctionOnLeave ): boolean {
		let returnValue: boolean = false;
		if( undefined !== this._states[ state ] ) {
			const pos: number = this._states[ state ].OnLeave.indexOf( func );
			if( -1 !== pos ) {
				this._states[ state ].OnLeave.splice( pos, 1 );
				returnValue = true;
			}
		}
		return returnValue;
	}

	public TransitionAdd( from: string, to: string ): boolean {
		let returnValue: boolean = false;
		if( ( undefined !== this._states[ from ] ) && ( undefined !== this._states[ to ] ) ) {
			if( undefined === this._transitions[ from ][ to ] ) {
				this._transitions[ from ][ to ] = {
					OnBefore: [],
					OnAfter: []
				};
				returnValue = true;
			}
		}
		return returnValue;
	}

	public TransitionDel( from: string, to: string ): boolean {
		let returnValue: boolean = false;
		if( ( undefined !== this._states[ from ] ) && ( undefined !== this._states[ to ] ) ) {
			if( undefined !== this._transitions[ from ][ to ] ) {
				delete ( this._transitions[ from ][ to ] );
				returnValue = true;
			}
		}
		return returnValue;
	}

	public TransitionOnBeforeAdd( from: string, to: string, func: FunctionOnTransitionBefore ): boolean {
		let returnValue: boolean = false;
		if( ( undefined !== this._states[ from ] ) && ( undefined !== this._states[ to ] ) ) {
			if( undefined !== this._transitions[ from ][ to ] ) {
				this._transitions[ from ][ to ].OnBefore.push( func );
				returnValue = true;
			}
		}
		return returnValue;
	}

	public TransitionOnBeforeDel( from: string, to: string, func: FunctionOnTransitionBefore ): boolean {
		let returnValue: boolean = false;
		if( ( undefined !== this._states[ from ] ) && ( undefined !== this._states[ to ] ) ) {
			if( undefined !== this._transitions[ from ][ to ] ) {
				const pos: number = this._transitions[ from ][ to ].OnBefore.indexOf( func );
				if( -1 !== pos ) {
					this._transitions[ from ][ to ].OnBefore.splice( pos, 1 );
					returnValue = true;
				}
			}
		}
		return returnValue;
	}

	public TransitionOnAfterAdd( from: string, to: string, func: FunctionOnTransitionAfter ): boolean {
		let returnValue: boolean = false;
		if( ( undefined !== this._states[ from ] ) && ( undefined !== this._states[ to ] ) ) {
			if( undefined !== this._transitions[ from ][ to ] ) {
				this._transitions[ from ][ to ].OnAfter.push( func );
				returnValue = true;
			}
		}
		return returnValue;
	}

	public TransitionOnAfterDel( from: string, to: string, func: FunctionOnTransitionAfter ): boolean {
		let returnValue: boolean = false;
		if( ( undefined !== this._states[ from ] ) && ( undefined !== this._states[ to ] ) ) {
			if( undefined !== this._transitions[ from ][ to ] ) {
				const pos: number = this._transitions[ from ][ to ].OnAfter.indexOf( func );
				if( -1 !== pos ) {
					this._transitions[ from ][ to ].OnAfter.splice( pos, 1 );
					returnValue = true;
				}
			}
		}
		return returnValue;
	}

	public StateGet(): string {
		return this._currentState;
	}

	public async StateSet( nextState: string ): Promise<boolean> {
		let returnValue: boolean = false;
		if( !this._inTransition ) {
			this._inTransition = true;
			if( undefined !== this._states[ nextState ] ) {
				if( ( undefined !== this._transitions[ this._currentState ] ) && ( undefined !== this._transitions[ this._currentState ][ nextState ] ) ) {
					returnValue = true;
					let cL1: number = this._transitions[ this._currentState ][ nextState ].OnBefore.length;
					for( let iL1: number = 0; ( returnValue && ( iL1 < cL1 ) ); iL1++ ) {
						if( 'function' === typeof ( this._transitions[ this._currentState ][ nextState ].OnBefore[ iL1 ] ) ) {
							returnValue = await this._transitions[ this._currentState ][ nextState ].OnBefore[ iL1 ]();
						}
					}
					if( returnValue ) {
						cL1 = this._states[ this._currentState ].OnLeave.length;
						for( let iL1: number = 0; iL1 < cL1; iL1++ ) {
							if( 'function' === typeof ( this._states[ this._currentState ].OnLeave[ iL1 ] ) ) {
								await this._states[ this._currentState ].OnLeave[ iL1 ]( this._currentState, nextState );
							}
						}
						const previousState: string = this._currentState;
						this._currentState = nextState;
						cL1 = this._transitions[ previousState ][ this._currentState ].OnAfter.length;
						for( let iL1: number = 0; iL1 < cL1; iL1++ ) {
							if( 'function' === typeof ( this._transitions[ previousState ][ this._currentState ].OnAfter[ iL1 ] ) ) {
								await this._transitions[ previousState ][ this._currentState ].OnAfter[ iL1 ]();
							}
						}
						cL1 = this._states[ this._currentState ].OnEnter.length;
						for( let iL1: number = 0; iL1 < cL1; iL1++ ) {
							if( 'function' === typeof ( this._states[ this._currentState ].OnEnter[ iL1 ] ) ) {
								await this._states[ this._currentState ].OnEnter[ iL1 ]( this._currentState, previousState );
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
