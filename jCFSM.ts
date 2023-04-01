namespace jCFSM {
	export type FunctionOnEnter = ( currentState: string, nextState: string ) => ( void | Promise<void> );
	export type FunctionOnLeave = ( currentState: string, prevState: string ) => ( void | Promise<void> );
	export type FunctionOnTransitionAfter = () => ( void | Promise<void> );
	export type FunctionOnTransitionBefore = () => ( any | Promise<any> );

	class StateMachine {
		private _inTransition: boolean = false;
		private _currentState: string;
		private _states: { [ key: string ]: { OnEnter: FunctionOnEnter[], OnLeave: FunctionOnLeave[] } } = {};
		private _transitions: { [ key: string ]: { [ key: string ]: { OnBefore: FunctionOnTransitionBefore[], OnAfter: FunctionOnTransitionAfter[] } } } = {};

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

		public TransitionOnBeforeAdd( from: string, to: string, func: FunctionOnTransitionBefore ): boolean {
			let returnValue = false;
			if( ( 'undefined' !== typeof ( this._states[ from ] ) ) && ( 'undefined' !== typeof ( this._states[ to ] ) ) ) {
				if( 'undefined' !== typeof ( this._transitions[ from ][ to ] ) ) {
					this._transitions[ from ][ to ].OnBefore.push( func );
					returnValue = true;
				}
			}
			return ( returnValue );
		}

		public TransitionOnBeforeDel( from: string, to: string, func: FunctionOnTransitionBefore ): boolean {
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

		public TransitionOnAfterAdd( from: string, to: string, func: FunctionOnTransitionAfter ): boolean {
			let returnValue = false;
			if( ( 'undefined' !== typeof ( this._states[ from ] ) ) && ( 'undefined' !== typeof ( this._states[ to ] ) ) ) {
				if( 'undefined' !== typeof ( this._transitions[ from ][ to ] ) ) {
					this._transitions[ from ][ to ].OnAfter.push( func );
					returnValue = true;
				}
			}
			return ( returnValue );
		}

		public TransitionOnAfterDel( from: string, to: string, func: FunctionOnTransitionAfter ): boolean {
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
						let cFL;
						// Check if I can enter the new state: in case a function return false, abort
						cFL = this._transitions[ this._currentState ][ nextState ].OnBefore.length;
						for( let iFL = 0; ( returnValue && ( iFL < cFL ) ); iFL++ ) {
							if( 'function' === typeof ( this._transitions[ this._currentState ][ nextState ].OnBefore[ iFL ] ) ) {
								let tmpValue = null;
								if( 'AsyncFunction' === this._transitions[ this._currentState ][ nextState ].OnBefore[ iFL ].constructor.name ) {
									tmpValue = await this._transitions[ this._currentState ][ nextState ].OnBefore[ iFL ]();
								} else {
									tmpValue = this._transitions[ this._currentState ][ nextState ].OnBefore[ iFL ]();
								}
								returnValue = ( false !== tmpValue );
							}
						}
						if( returnValue ) {
							cFL = this._states[ this._currentState ].OnLeave.length;
							for( let iFL = 0; iFL < cFL; iFL++ ) {
								if( 'function' === typeof ( this._states[ this._currentState ].OnLeave[ iFL ] ) ) {
									if( 'AsyncFunction' === this._states[ this._currentState ].OnLeave[ iFL ].constructor.name ) {
										await this._states[ this._currentState ].OnLeave[ iFL ]( this._currentState, nextState );
									} else {
										this._states[ this._currentState ].OnLeave[ iFL ]( this._currentState, nextState );
									}
								}
							}
							let previousState: string = this._currentState;
							this._currentState = nextState;
							cFL = this._transitions[ previousState ][ this._currentState ].OnAfter.length;
							for( let iFL = 0; iFL < cFL; iFL++ ) {
								if( 'function' === typeof ( this._transitions[ previousState ][ this._currentState ].OnAfter[ iFL ] ) ) {
									if( 'AsyncFunction' === this._transitions[ previousState ][ this._currentState ].OnAfter[ iFL ].constructor.name ) {
										await this._transitions[ previousState ][ this._currentState ].OnAfter[ iFL ]();
									} else {
										this._transitions[ previousState ][ this._currentState ].OnAfter[ iFL ]();
									}
								}
							}
							cFL = this._states[ this._currentState ].OnEnter.length;
							for( let iFL = 0; iFL < cFL; iFL++ ) {
								if( 'function' === typeof ( this._states[ this._currentState ].OnEnter[ iFL ] ) ) {
									if( 'AsyncFunction' === this._states[ this._currentState ].OnEnter[ iFL ].constructor.name ) {
										await this._states[ this._currentState ].OnEnter[ iFL ]( this._currentState, previousState );
									} else {
										this._states[ this._currentState ].OnEnter[ iFL ]( this._currentState, previousState );
									}
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
if( 'object' === typeof exports ) {
	// @ts-ignore
	exports.Create = jCFSM.Create;
}