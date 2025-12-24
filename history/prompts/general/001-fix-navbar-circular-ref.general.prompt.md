---
id: 1
title: Fix Circular Type Reference in NavbarItem
stage: general
date: 2025-12-23
surface: agent
model: gemini-2.0-flash-thinking-exp
feature: none
branch: main
user: Dell
command: none
labels: ["typescript", "docusaurus", "circular-reference"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - c:\Users\Dell\Desktop\Quarter 4\Hacathon\physical-ai-and-humanoid-robotics-textbook\frontend\src\theme\NavbarItem\index.tsx
tests:
  - npx tsc src/theme/NavbarItem/index.tsx --noEmit --esModuleInterop --jsx react-jsx --skipLibCheck --moduleResolution node --target esnext
---

# Prompt
Explain what this problem is and help me fix it: 'props' is referenced directly or indirectly in its own type annotation. @[c:\Users\Dell\Desktop\Quarter 4\Hacathon\physical-ai-and-humanoid-robotics-textbook\frontend\src\theme\NavbarItem\index.tsx:L9]

# Response
The error happens because the swizzled component `NavbarItemWrapper` in `src/theme/NavbarItem/index.tsx` was importing its own type from `@theme/NavbarItem` to define its `Props`. Since `@theme/NavbarItem` resolves to this exact file, it created a circular type reference. I fixed this by changing the import to point to `@theme-original/NavbarItem`, which is the base component provided by Docusaurus.

# Outcome
The circular reference error is resolved. Verified via `tsc` check.
