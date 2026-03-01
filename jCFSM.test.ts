import test from 'ava';
import jCFSM from './jCFSM.js';

let prefix: string = '';

{
	prefix = 'StateAdd';

	test( prefix + ': returns true for a new state', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		t.true( fsm.StateAdd( 'running' ) );
	} );

	test( prefix + ': returns false for a duplicate state', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		t.false( fsm.StateAdd( 'idle' ) );
	} );
}

{
	prefix = 'StateDel';

	test( prefix + ': returns true for an existing state', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		t.true( fsm.StateDel( 'running' ) );
	} );

	test( prefix + ': returns false for a non-existent state', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		t.false( fsm.StateDel( 'nonexistent' ) );
	} );

	test( prefix + ': removes outgoing transitions', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.StateDel( 'running' );
		t.false( await fsm.StateSet( 'running' ) );
	} );

	test( prefix + ': removes incoming transitions', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.StateAdd( 'stopped' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionAdd( 'running', 'stopped' );
		await fsm.StateSet( 'running' );
		fsm.StateDel( 'idle' );
		const fsm2 = new jCFSM( 'idle' );
		fsm2.StateAdd( 'running' );
		fsm2.TransitionAdd( 'idle', 'running' );
		fsm2.StateDel( 'idle' );
		t.false( await fsm2.StateSet( 'running' ) );
	} );
}

{
	prefix = 'StateGet';

	test( prefix + ': returns the initial state', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		t.is( fsm.StateGet(), 'idle' );
	} );
}

{
	prefix = 'TransitionAdd';

	test( prefix + ': returns true for valid states', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		t.true( fsm.TransitionAdd( 'idle', 'running' ) );
	} );

	test( prefix + ': returns false for a non-existent from state', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		t.false( fsm.TransitionAdd( 'nonexistent', 'running' ) );
	} );

	test( prefix + ': returns false for a non-existent to state', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		t.false( fsm.TransitionAdd( 'idle', 'nonexistent' ) );
	} );

	test( prefix + ': returns false for a duplicate transition', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		t.false( fsm.TransitionAdd( 'idle', 'running' ) );
	} );
}

{
	prefix = 'TransitionDel';

	test( prefix + ': returns true for an existing transition', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		t.true( fsm.TransitionDel( 'idle', 'running' ) );
	} );

	test( prefix + ': returns false for a non-existent transition', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		t.false( fsm.TransitionDel( 'idle', 'running' ) );
	} );

	test( prefix + ': prevents transition after deletion', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionDel( 'idle', 'running' );
		t.false( await fsm.StateSet( 'running' ) );
	} );
}

{
	prefix = 'StateSet';

	test( prefix + ': returns false without a defined transition', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		t.false( await fsm.StateSet( 'running' ) );
	} );

	test( prefix + ': returns true with a valid transition', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		t.true( await fsm.StateSet( 'running' ) );
	} );

	test( prefix + ': updates current state on success', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		await fsm.StateSet( 'running' );
		t.is( fsm.StateGet(), 'running' );
	} );

	test( prefix + ': returns false for a non-existent target state', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		t.false( await fsm.StateSet( 'nonexistent' ) );
	} );

	test( prefix + ': does not change state when transition is invalid', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		await fsm.StateSet( 'running' );
		t.is( fsm.StateGet(), 'idle' );
	} );
}

{
	prefix = 'OnBefore';

	test( prefix + ': aborts transition when returning false', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionOnBeforeAdd( 'idle', 'running', () => false );
		t.false( await fsm.StateSet( 'running' ) );
		t.is( fsm.StateGet(), 'idle' );
	} );

	test( prefix + ': allows transition when returning non-false', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionOnBeforeAdd( 'idle', 'running', () => true );
		t.true( await fsm.StateSet( 'running' ) );
	} );

	test( prefix + ': aborts when async callback returns false', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionOnBeforeAdd( 'idle', 'running', async () => false );
		t.false( await fsm.StateSet( 'running' ) );
	} );

	test( prefix + ': allows when async callback returns non-false', async ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionOnBeforeAdd( 'idle', 'running', async () => true );
		t.true( await fsm.StateSet( 'running' ) );
	} );

	test( prefix + ': del returns true when removed', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		const cb = () => true;
		fsm.TransitionOnBeforeAdd( 'idle', 'running', cb );
		t.true( fsm.TransitionOnBeforeDel( 'idle', 'running', cb ) );
	} );

	test( prefix + ': del returns false when callback not found', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		t.false( fsm.TransitionOnBeforeDel( 'idle', 'running', () => true ) );
	} );
}

{
	prefix = 'OnAfter';

	test( prefix + ': is called after transition', async ( t ) => {
		let called: boolean = false;
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionOnAfterAdd( 'idle', 'running', () => { called = true; } );
		await fsm.StateSet( 'running' );
		t.true( called );
	} );

	test( prefix + ': async callback is awaited', async ( t ) => {
		let called: boolean = false;
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionOnAfterAdd( 'idle', 'running', async () => {
			await Promise.resolve();
			called = true;
		} );
		await fsm.StateSet( 'running' );
		t.true( called );
	} );

	test( prefix + ': not called when OnBefore aborts', async ( t ) => {
		let called: boolean = false;
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionOnBeforeAdd( 'idle', 'running', () => false );
		fsm.TransitionOnAfterAdd( 'idle', 'running', () => { called = true; } );
		await fsm.StateSet( 'running' );
		t.false( called );
	} );

	test( prefix + ': del returns true when removed', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		const cb = () => {};
		fsm.TransitionOnAfterAdd( 'idle', 'running', cb );
		t.true( fsm.TransitionOnAfterDel( 'idle', 'running', cb ) );
	} );

	test( prefix + ': del returns false when callback not found', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		t.false( fsm.TransitionOnAfterDel( 'idle', 'running', () => {} ) );
	} );
}

{
	prefix = 'OnEnter';

	test( prefix + ': is called when entering a state', async ( t ) => {
		let called: boolean = false;
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.StateOnEnterAdd( 'running', () => { called = true; } );
		await fsm.StateSet( 'running' );
		t.true( called );
	} );

	test( prefix + ': receives correct currentState and previousState', async ( t ) => {
		let receivedCurrent: string = '';
		let receivedPrevious: string = '';
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.StateOnEnterAdd( 'running', ( currentState, previousState ) => {
			receivedCurrent = currentState;
			receivedPrevious = previousState;
		} );
		await fsm.StateSet( 'running' );
		t.is( receivedCurrent, 'running' );
		t.is( receivedPrevious, 'idle' );
	} );

	test( prefix + ': async callback is awaited', async ( t ) => {
		let called: boolean = false;
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.StateOnEnterAdd( 'running', async () => {
			await Promise.resolve();
			called = true;
		} );
		await fsm.StateSet( 'running' );
		t.true( called );
	} );

	test( prefix + ': not called when OnBefore aborts', async ( t ) => {
		let called: boolean = false;
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionOnBeforeAdd( 'idle', 'running', () => false );
		fsm.StateOnEnterAdd( 'running', () => { called = true; } );
		await fsm.StateSet( 'running' );
		t.false( called );
	} );

	test( prefix + ': add returns false for a duplicate callback', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		const cb = () => {};
		fsm.StateOnEnterAdd( 'running', cb );
		t.false( fsm.StateOnEnterAdd( 'running', cb ) );
	} );

	test( prefix + ': del returns true when removed', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		const cb = () => {};
		fsm.StateOnEnterAdd( 'idle', cb );
		t.true( fsm.StateOnEnterDel( 'idle', cb ) );
	} );

	test( prefix + ': del returns false when callback not found', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		t.false( fsm.StateOnEnterDel( 'idle', () => {} ) );
	} );
}

{
	prefix = 'OnLeave';

	test( prefix + ': is called when leaving a state', async ( t ) => {
		let called: boolean = false;
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.StateOnLeaveAdd( 'idle', () => { called = true; } );
		await fsm.StateSet( 'running' );
		t.true( called );
	} );

	test( prefix + ': receives correct currentState and nextState', async ( t ) => {
		let receivedCurrent: string = '';
		let receivedNext: string = '';
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.StateOnLeaveAdd( 'idle', ( currentState, nextState ) => {
			receivedCurrent = currentState;
			receivedNext = nextState;
		} );
		await fsm.StateSet( 'running' );
		t.is( receivedCurrent, 'idle' );
		t.is( receivedNext, 'running' );
	} );

	test( prefix + ': async callback is awaited', async ( t ) => {
		let called: boolean = false;
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.StateOnLeaveAdd( 'idle', async () => {
			await Promise.resolve();
			called = true;
		} );
		await fsm.StateSet( 'running' );
		t.true( called );
	} );

	test( prefix + ': not called when OnBefore aborts', async ( t ) => {
		let called: boolean = false;
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionOnBeforeAdd( 'idle', 'running', () => false );
		fsm.StateOnLeaveAdd( 'idle', () => { called = true; } );
		await fsm.StateSet( 'running' );
		t.false( called );
	} );

	test( prefix + ': add returns false for a duplicate callback', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		const cb = () => {};
		fsm.StateOnLeaveAdd( 'idle', cb );
		t.false( fsm.StateOnLeaveAdd( 'idle', cb ) );
	} );

	test( prefix + ': del returns true when removed', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		const cb = () => {};
		fsm.StateOnLeaveAdd( 'idle', cb );
		t.true( fsm.StateOnLeaveDel( 'idle', cb ) );
	} );

	test( prefix + ': del returns false when callback not found', ( t ) => {
		const fsm = new jCFSM( 'idle' );
		t.false( fsm.StateOnLeaveDel( 'idle', () => {} ) );
	} );
}

{
	prefix = 'Callback order';

	test( prefix + ': OnBefore → OnLeave → OnAfter → OnEnter', async ( t ) => {
		const order: string[] = [];
		const fsm = new jCFSM( 'idle' );
		fsm.StateAdd( 'running' );
		fsm.TransitionAdd( 'idle', 'running' );
		fsm.TransitionOnBeforeAdd( 'idle', 'running', () => { order.push( 'OnBefore' ); return true; } );
		fsm.StateOnLeaveAdd( 'idle', () => { order.push( 'OnLeave' ); } );
		fsm.TransitionOnAfterAdd( 'idle', 'running', () => { order.push( 'OnAfter' ); } );
		fsm.StateOnEnterAdd( 'running', () => { order.push( 'OnEnter' ); } );
		await fsm.StateSet( 'running' );
		t.deepEqual( order, [ 'OnBefore', 'OnLeave', 'OnAfter', 'OnEnter' ] );
	} );
}
