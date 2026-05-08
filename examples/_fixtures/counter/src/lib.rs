// Counter — a minimal Klever smart-contract fixture.
//
// Purpose:
//   This contract is the "hello world" of klever-sc. It is consumed by examples in
//     - examples/common/sc-query-readonly        (calls `get_value`)
//     - examples/common/sc-events-parse          (parses `counter_changed` events)
//     - examples/common/sc-abi-load-and-validate (loads counter.abi.json)
//     - examples/nodejs/sc-deploy
//     - examples/nodejs/sc-invoke-mutable        (calls `increment` / `add`)
//     - examples/nodejs/sc-deploy-and-interact-end-to-end
//     - examples/reactjs/react-sc-readonly-query
//     - examples/reactjs/react-sc-invoke-with-extension
//
// Public surface:
//   - init()                    constructor — initialises counter to 0
//   - increment()               adds 1 to the stored counter and emits an event
//   - add(value: u64)           adds `value` to the stored counter and emits an event
//   - get_value() -> u64        view — returns the current counter value
//
// Events:
//   - counter_changed(new_value)  emitted on every state change so that
//                                  sc-events-parse has a concrete event to decode.
//
// TODO(KLC-2322): verify against the latest `klever-sc` macro surface — the macros
// (#[klever_sc::contract], #[init], #[endpoint], #[view], #[event]) and the
// `BigUint` -> `u64` story below mirror MultiversX's `multiversx_sc` 1:1 as of
// klever-sc 0.45.0. Adjust when newer klever-sc revs publish.
#![no_std]

klever_sc::imports!();
klever_sc::derive_imports!();

#[klever_sc::contract]
pub trait Counter {
    /// Constructor. Runs once at deploy time and zeroes the counter.
    /// `init` is the canonical name; `klever-sc-meta` codegen wires it up
    /// as the WASM `init` export.
    #[init]
    fn init(&self) {
        self.value().set(0u64);
    }

    /// Increment the counter by 1.
    ///
    /// `#[endpoint]` makes this callable by an external transaction (it shows up
    /// in the ABI under `endpoints[]`).
    #[endpoint]
    fn increment(&self) {
        let current = self.value().get();
        let next = current + 1u64;
        self.value().set(next);
        self.counter_changed_event(&next);
    }

    /// Add `value` to the counter.
    ///
    /// Demonstrates accepting a typed argument. ABI-encoded as `u64`.
    #[endpoint]
    fn add(&self, value: u64) {
        let current = self.value().get();
        let next = current + value;
        self.value().set(next);
        self.counter_changed_event(&next);
    }

    /// Read the current counter value.
    ///
    /// `#[view]` marks the endpoint as readonly: clients should reach it via
    /// `provider.queryContract({ scAddress, funcName: 'get_value' })` or via
    /// `Contract.call('get_value')` — no transaction needed.
    #[view(getValue)]
    fn get_value(&self) -> u64 {
        self.value().get()
    }

    /// Storage mapper for the counter value.
    ///
    /// klever-sc auto-derives the storage key from the method name. Here the
    /// key is the literal byte-string `"value"`.
    #[storage_mapper("value")]
    fn value(&self) -> SingleValueMapper<u64>;

    /// Event emitted on every state change.
    ///
    /// The first generic-style `#[event("counter_changed")]` defines the topic
    /// name; the function arg becomes the event data. Clients decode it in
    /// `examples/common/sc-events-parse` via `contract.parseEvents(receipt.logs)`.
    #[event("counter_changed")]
    fn counter_changed_event(&self, #[indexed] new_value: &u64);
}
