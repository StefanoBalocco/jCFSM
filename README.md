# jCFSM

A compact finite state machine for JavaScript and TypeScript, with async callback support and zero runtime dependencies.

## Features

- **Explicit transitions** — only registered transitions succeed; all others return `false`
- **Four callback hooks** — `OnBefore`, `OnLeave`, `OnAfter`, `OnEnter` — sync or async
- **Guard support** — `OnBefore` callbacks abort a transition by returning `false`
- **Re-entrant safe** — `StateSet` calls nested inside a callback return `false` without side effects
- **Zero dependencies** — no runtime dependencies
- **TypeScript** — full type definitions included

## Installation

**npm / bundler:**

```sh
npm install jcfsm
```

**Browser (CDN):**

```html
<script type="module">
	import jCFSM from 'https://unpkg.com/jcfsm@2.0.0/jcfsm.min.js';

	const fsm = new jCFSM( 'idle' );
	fsm.StateAdd( 'running' );
	fsm.TransitionAdd( 'idle', 'running' );

	await fsm.StateSet( 'running' );
	console.log( fsm.StateGet() ); // 'running'
</script>
```

## Quick Start

```typescript
import jCFSM from 'jcfsm';

const fsm = new jCFSM( 'idle' );

fsm.StateAdd( 'running' );
fsm.StateAdd( 'stopped' );

fsm.TransitionAdd( 'idle', 'running' );
fsm.TransitionAdd( 'running', 'stopped' );

fsm.StateOnEnterAdd( 'running', ( current, prev ) => {
	console.log( `Entered ${current} from ${prev}` );
} );

fsm.TransitionOnBeforeAdd( 'running', 'stopped', async () => {
	const allowed = await checkIfStopIsAllowed();
	return allowed;
} );

await fsm.StateSet( 'running' ); // true
await fsm.StateSet( 'idle' );    // false — no transition defined
await fsm.StateSet( 'stopped' ); // true or false — depends on the guard
```

## Callback Execution Order

When `StateSet` succeeds, callbacks fire in this order:

```
OnBefore → OnLeave → OnAfter → OnEnter
```

If any `OnBefore` callback returns `false`, the transition aborts immediately. `OnLeave`, `OnAfter`, and `OnEnter` do not fire.

## API

### Constructor

```typescript
new jCFSM( initialState: string )
```

Creates a new FSM. The initial state is registered automatically.

---

### State management

| Method | Returns | Description |
|---|---|---|
| `StateAdd( state )` | `boolean` | Registers a new state. Returns `false` if the state already exists. |
| `StateDel( state )` | `boolean` | Removes a state and all its associated transitions. Returns `false` if the state does not exist. |
| `StateGet()` | `string` | Returns the current state. |
| `StateSet( state )` | `Promise<boolean>` | Triggers a transition to `state`. Returns `false` if the transition is not defined, if a guard aborts it, or if another transition is already in progress. |

---

### State callbacks

These callbacks fire whenever the machine enters or leaves a specific state, regardless of which transition triggered the change.

**Signatures:**

```typescript
type FunctionOnEnter = ( currentState: string, prevState: string ) => void | Promise<void>;
type FunctionOnLeave = ( currentState: string, nextState: string ) => void | Promise<void>;
```

| Method | Description |
|---|---|
| `StateOnEnterAdd( state, func )` | Registers a callback that fires after entering `state`. Returns `false` if the state does not exist or the callback is already registered. |
| `StateOnEnterDel( state, func )` | Removes an enter callback. Returns `false` if the callback is not found. |
| `StateOnLeaveAdd( state, func )` | Registers a callback that fires before leaving `state`. Returns `false` if the state does not exist or the callback is already registered. |
| `StateOnLeaveDel( state, func )` | Removes a leave callback. Returns `false` if the callback is not found. |

---

### Transition management

Transitions define which state changes are allowed. `StateSet` fails unless the corresponding transition is registered.

| Method | Returns | Description |
|---|---|---|
| `TransitionAdd( from, to )` | `boolean` | Registers the transition from `from` to `to`. Returns `false` if either state does not exist or the transition already exists. |
| `TransitionDel( from, to )` | `boolean` | Removes the transition. Returns `false` if the transition does not exist. |

---

### Transition callbacks

These callbacks fire only for a specific `from → to` pair.

**Signatures:**

```typescript
type FunctionOnTransitionBefore = () => boolean | Promise<boolean>;
type FunctionOnTransitionAfter  = () => void    | Promise<void>;
```

| Method | Description |
|---|---|
| `TransitionOnBeforeAdd( from, to, func )` | Registers a guard that fires before the transition. Return `false` to abort. Returns `false` if the transition does not exist. |
| `TransitionOnBeforeDel( from, to, func )` | Removes a before callback. Returns `false` if the callback is not found. |
| `TransitionOnAfterAdd( from, to, func )` | Registers a callback that fires after the transition completes. Returns `false` if the transition does not exist. |
| `TransitionOnAfterDel( from, to, func )` | Removes an after callback. Returns `false` if the callback is not found. |

---

## License

See [LICENSE.md](LICENSE.md).
