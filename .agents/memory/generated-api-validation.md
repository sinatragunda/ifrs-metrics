---
name: Generated API validation
description: Integration requirements and validation gaps found in the generated API client stack.
---

Keep API client hooks beneath a shared React Query provider. Also verify generated Zod schemas enforce all constraints from OpenAPI: `uniqueItems` was present in the contract but not enforced by generated validation, so duplicate array entries need an explicit server-side check.

**Why:** integrating an API mutation exposed both the missing provider at the app root and a gap between the OpenAPI array contract and generated runtime validation.

**How to apply:** when adding a generated query or mutation to a page, confirm the app shell provides `QueryClientProvider`; for `uniqueItems` schemas, validate uniqueness on the server even when the generated Zod validator succeeds.
