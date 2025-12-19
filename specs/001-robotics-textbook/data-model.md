# Data Model: Physical AI & Humanoid Robotics Textbook

**Feature**: `001-robotics-textbook`
**Date**: 2025-12-07

## 1. Content Entities (Markdown Files)

### Chapter (Generic)
Represents a single documentation page.

**File Path**: `docs/**/*.md` or `docs/**/*.mdx`

**Frontmatter Schema**:
```yaml
title: string (required) - Display title
description: string (required) - SEO summary
sidebar_position: number (optional) - Order in sidebar
tags: string[] (optional) - Filtering tags
draft: boolean (optional) - If true, excluded from build
image: string (optional) - Social sharing image
```

### Module Index
Represents the entry point for a Module.

**File Path**: `docs/modules/*/index.md` (or `intro.md`)

**Frontmatter**:
```yaml
slug: /modules/<module-name>
title: <Module Name>
sidebar_class_name: module-index
```

### Weekly Schedule
Represents a week's curriculum.

**File Path**: `docs/weeks/week-XX.md`

**Frontmatter**:
```yaml
title: Week XX: <Topic>
slug: /weeks/<week-number>
```

## 2. Configuration Entities

### Sidebar Definition (`sidebars.ts`)

**Schema**:
```typescript
type SidebarConfig = {
  modulesSidebar: SidebarItem[];
  weeksSidebar: SidebarItem[];
  hardwareSidebar: SidebarItem[];
};
```

### Docusaurus Config (`docusaurus.config.ts`)

**Key Fields**:
- `url`: Production URL
- `baseUrl`: Base path
- `presets`: Standard preset config (docs, theme)
- `themeConfig`: Navbar, footer, color mode, mermaid
