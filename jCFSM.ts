'use strict';
namespace jCFSM {
	export type FunctionOnEnter = ( currentState: string, nextState: string ) => ( void | Promise<void> );
	export type FunctionOnLeave = ( currentState: string, prevState: string ) => ( void | Promise<void> );
	export type FunctionOnTransition = () => ( void | Promise<void> );

	class StateMachine {
		private _inTransition: boolean = false;
		private _currentState: string;
		private _states: { [ key: string ]: { OnEnter: FunctionOnEnter[], OnLeave: FunctionOnLeave[] } } = {};
		private _transitions: { [ key: string ]: { [ key: string ]: { OnBefore: FunctionOnTransition[], OnAfter: FunctionOnTransition[] } } } = {};

		constructor( initialState: string ) {
			this.StateAdd( initialState );
			this._currentState = initialState;
		}

		public StateAdd( state: string ): boolean {
			let returnValue = false;
			if( 'undefined' === typeof ( this._states[ state ] ) ) {
				this._states[ state ] = {
					OnEnter: [],
					OnLeave: []
				};
				this._transitions[ state ] = {};
				returnValue = true;
			}
			return ( returnValue );
		}

		public StateDel( state: string ): boolean {
			let returnValue = false;
			if( 'undefined' !== typeof ( this._states[ state ] ) ) {
				delete ( this._states[ state ] );
				if( 'undefined' !== typeof ( this._transitions[ state ] ) ) {
					delete ( this._transitions[ state ] );
				}
				for( const tmpState in this._transitions ) {
					if( 'undefined' !== typeof ( this._transitions[ tmpState ][ state ] ) ) {
						delete ( this._transitions[ tmpState ][ state ] );
					}
				}
				returnValue = true;
			}
			return ( returnValue );
		}

		public StateOnEnterAdd( state: string, func: FunctionOnEnter ): boolean {
			let returnValue = false;
			if( 'undefined' !== typeof ( this._states[ state ] ) ) {
				if( !this._states[ state ].OnEnter.includes( func ) ) {
					this._states[ state ].OnEnter.push( func );
					returnValue = true;
				}
			}
			return ( returnValue );
		}

		public StateOnEnterDel( state: string, func: FunctionOnEnter ): boolean {
			let returnValue = false;
			if( 'undefined' !== typeof ( this._states[ state ] ) ) {
				const pos = this._states[ state ].OnEnter.indexOf( func );
				if( -1 !== pos ) {
					this._states[ state ].OnEnter.splice( pos, 1 );
					returnValue = true;
				}
			}
			return ( returnValue );
		}

		public StateOnLeaveAdd( state: string, func: FunctionOnLeave ): boolean {
			let returnValue = false;
			if( 'undefined' !== typeof ( this._states[ state ] ) ) {
				if( !this._states[ state ].OnLeave.includes( func ) ) {
					this._states[ state ].OnLeave.push( func );
					returnValue = true;
				}
			}
			return ( returnValue );
		}

		public StateOnLeaveDel( state: string, func: FunctionOnLeave ): boolean {
			let returnValue = false;
			if( 'undefined' !== typeof ( this._states[ state ] ) ) {
				const pos = this._states[ state ].OnLeave.indexOf( func );
				if( -1 !== pos ) {
					this._states[ state ].OnLeave.splice( pos, 1 );
					returnValue = true;
				}
			}
			return ( returnValue );
		}

		public TransitionAdd( from: string, to: string ): boolean {
			let returnValue = false;
			if( ( 'undefined' !== typeof ( this._states[ from ] ) ) && ( 'undefined' !== typeof ( this._states[ to ] ) ) ) {
				if( 'undefined' === typeof ( this._transitions[ from ][ to ] ) ) {
					this._transitions[ from ][ to ] = {
						OnBefore: [],
						OnAfter: []
					};
					returnValue = true;
				}
			}
			return ( returnValue );
		}

		public TransitionDel( from: string, to: string ): boolean {
			let returnValue = false;
			if( ( 'undefined' !== typeof ( this._states[ from ] ) ) && ( 'undefined' !== typeof ( this._states[ to ] ) ) ) {
				if( 'undefined' !== typeof ( this._transitions[ from ][ to ] ) ) {
					delete ( this._transitions[ from ][ to ] );
					returnValue = true;
				}
			}
			return ( returnValue );
		}

		public TransitionOnBeforeAdd( from: string, to: string, func: FunctionOnTransition ): boolean {
			let returnValue = false;
			if( ( 'undefined' !== typeof ( this._states[ from ] ) ) && ( 'undefined' !== typeof ( this._states[ to ] ) ) ) {
				if( 'undefined' !== typeof ( this._transitions[ from ][ to ] ) ) {
					this._transitions[ from ][ to ].OnBefore.push( func );
					returnValue = true;
				}
			}
			return ( returnValue );
		}

		public TransitionOnBeforeDel( from: string, to: string, func: FunctionOnTransition ): boolean {
			let returnValue = false;
			if( ( 'undefined' !== typeof ( this._states[ from ] ) ) && ( 'undefined' !== typeof ( this._states[ to ] ) ) ) {
				if( 'undefined' !== typeof ( this._transitions[ from ][ to ] ) ) {
					const pos = this._transitions[ from ][ to ].OnBefore.indexOf( func );
					if( -1 !== pos ) {
						this._transitions[ from ][ to ].OnBefore.splice( pos, 1 );
						returnValue = true;
					}
				}
			}
			return ( returnValue );
		}

		public TransitionOnAfterAdd( from: string, to: string, func: FunctionOnTransition ): boolean {
			let returnValue = false;
			if( ( 'undefined' !== typeof ( this._states[ from ] ) ) && ( 'undefined' !== typeof ( this._states[ to ] ) ) ) {
				if( 'undefined' !== typeof ( this._transitions[ from ][ to ] ) ) {
					this._transitions[ from ][ to ].OnAfter.push( func );
					returnValue = true;
				}
			}
			return ( returnValue );
		}

		public TransitionOnAfterDel( from: string, to: string, func: FunctionOnTransition ): boolean {
			let returnValue = false;
			if( ( 'undefined' !== typeof ( this._states[ from ] ) ) && ( 'undefined' !== typeof ( this._states[ to ] ) ) ) {
				if( 'undefined' !== typeof ( this._transitions[ from ][ to ] ) ) {
					const pos = this._transitions[ from ][ to ].OnAfter.indexOf( func );
					if( -1 !== pos ) {
						this._transitions[ from ][ to ].OnAfter.splice( pos, 1 );
						returnValue = true;
					}
				}
			}
			return ( returnValue );
		}

		public StateGet(): string {
			return ( this._currentState );
		}

		public async StateSet( nextState: string ): Promise<boolean> {
			let returnValue = false;
			if( !this._inTransition ) {
				this._inTransition = true;
				if( 'undefined' !== typeof ( this._states[ nextState ] ) ) {
					if( ( 'undefined' !== typeof ( this._transitions[ this._currentState ] ) ) && ( 'undefined' !== typeof ( this._transitions[ this._currentState ][ nextState ] ) ) ) {
						returnValue = true;
						let countFirstLevel;
						countFirstLevel = this._states[ this._currentState ].OnLeave.length;
						for( let indexFirstLevel = 0; indexFirstLevel < countFirstLevel; indexFirstLevel++ ) {
							if( 'function' === typeof ( this._states[ this._currentState ].OnLeave[ indexFirstLevel ] ) ) {
								if( 'AsyncFunction' === this._states[ this._currentState ].OnLeave[ indexFirstLevel ].constructor.name ) {
									await this._states[ this._currentState ].OnLeave[ indexFirstLevel ]( this._currentState, nextState );
								}
								else {
									this._states[ this._currentState ].OnLeave[ indexFirstLevel ]( this._currentState, nextState );
								}
							}
						}
						countFirstLevel = this._transitions[ this._currentState ][ nextState ].OnBefore.length;
						for( let indexFirstLevel = 0; indexFirstLevel < countFirstLevel; indexFirstLevel++ ) {
							if( 'function' === typeof ( this._transitions[ this._currentState ][ nextState ].OnBefore[ indexFirstLevel ] ) ) {
								if( 'AsyncFunction' === this._transitions[ this._currentState ][ nextState ].OnBefore[ indexFirstLevel ].constructor.name ) {
									await this._transitions[ this._currentState ][ nextState ].OnBefore[ indexFirstLevel ]();
								}
								else {
									this._transitions[ this._currentState ][ nextState ].OnBefore[ indexFirstLevel ]();
								}
							}
						}
						let previousState: string = this._currentState;
						this._currentState = nextState;
						countFirstLevel = this._transitions[ previousState ][ this._currentState ].OnAfter.length;
						for( let indexFirstLevel = 0; indexFirstLevel < countFirstLevel; indexFirstLevel++ ) {
							if( 'function' === typeof ( this._transitions[ previousState ][ this._currentState ].OnAfter[ indexFirstLevel ] ) ) {
								if( 'AsyncFunction' === this._transitions[ previousState ][ this._currentState ].OnAfter[ indexFirstLevel ].constructor.name ) {
									await this._transitions[ previousState ][ this._currentState ].OnAfter[ indexFirstLevel ]();
								}
								else {
									this._transitions[ previousState ][ this._currentState ].OnAfter[ indexFirstLevel ]();
								}
							}
						}
						countFirstLevel = this._states[ this._currentState ].OnEnter.length;
						for( let indexFirstLevel = 0; indexFirstLevel < countFirstLevel; indexFirstLevel++ ) {
							if( 'function' === typeof ( this._states[ this._currentState ].OnEnter[ indexFirstLevel ] ) ) {
								if( 'AsyncFunction' === this._states[ this._currentState ].OnEnter[ indexFirstLevel ].constructor.name ) {
									await this._states[ this._currentState ].OnEnter[ indexFirstLevel ]( this._currentState, previousState );
								}
								else {
									this._states[ this._currentState ].OnEnter[ indexFirstLevel ]( this._currentState, previousState );
								}
							}
						}
					}
				}
				this._inTransition = false;
			}
			return ( returnValue );
		}
	}

	export function Create( initialState: string ): StateMachine {
		return new StateMachine( initialState );
	}
}
// @ts-ignore
if( 'object' === typeof ( exports ) ) {
	// @ts-ignore
	exports.Create = jCFSM.Create;
}