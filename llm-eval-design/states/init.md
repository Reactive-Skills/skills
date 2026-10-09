# INIT
Retrieve the runtime bootloader for llm-eval-design and select a compatible transport.
Verify runtime version, required capabilities, and hierarchical parent dispatch.
Store selected_runtime with compatible, runtime_version, capabilities, transport, launcher, and parent_dispatch_verified.
Emit RUNTIME_READY with compatible: true and contextUpdates.selected_runtime, or SETUP_REQUIRED with compatible: false and a reason.
## Atomic Gate
Actual runtime preflight supports the declared requirements.
Compatibility is observed, never assumed.
