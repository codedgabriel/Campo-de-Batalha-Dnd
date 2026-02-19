## Packages
@hello-pangea/dnd | Drag and drop functionality for the initiative list
nanoid | Unique ID generation for characters
framer-motion | Animations for list reordering and turns

## Notes
- LocalStorage persistence strategy:
  - Hooks will sync to localStorage instead of a real backend API for this specific app request.
  - Mimicking async API behavior with setTimeout for realistic UI states (loading, etc) even though it's local.
