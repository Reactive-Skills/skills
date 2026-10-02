# INIT
Retrieve the runtime bootloader for experiment-loop and select a compatible transport.
Verify runtime version, required capabilities, and hierarchical parent dispatch.
Store selected_runtime with compatibility, capabilities, transport, launcher, and parent_dispatch_verified.
Emit RUNTIME_READY with compatible: true, or SETUP_REQUIRED with compatible: false and a reason.
## Atomic Gate
Actual runtime preflight supports the declared requirements; compatibility is observed rather than assumed.
