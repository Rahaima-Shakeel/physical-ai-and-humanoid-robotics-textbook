# Tasks: Physical AI & Humanoid Robotics Textbook

**Input**: Design documents from `/specs/001-robotics-textbook/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md
**Feature Branch**: `001-robotics-textbook`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Docusaurus project and configure the core build pipeline.

- [x] T001 Create Docusaurus 3.9 project scaffold in root
- [x] T002 [P] Install core dependencies (`@docusaurus/theme-search-local`, `@docusaurus/theme-mermaid`)
- [x] T003 Configure `docusaurus.config.ts` (Project metadata, URL, presets)
- [x] T004 [P] Configure `sidebars.ts` with placeholders for modules, weeks, and hardware
- [x] T005 [P] Setup `static/img` directory structure (diagrams, hardware)
- [x] T006 Configure GitHub Actions for build and deployment (`.github/workflows/deploy.yml`)
- [x] T007 [P] Configure markdown linting rules (`.markdownlint.json`)

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the structure and routing that all content depends on.

- [x] T008 Implement `docs/modules/` directory structure with `intro.md` stubs
- [x] T009 Implement `docs/weeks/` directory structure (week-01 to week-13)
- [x] T010 Implement `docs/hardware/` directory structure
- [x] T011 [P] Configure local search plugin in `docusaurus.config.ts`
- [x] T012 [P] Configure Mermaid diagrams plugin in `docusaurus.config.ts`
- [x] T013 Create Chapter template (or instructions) in `CONTRIBUTING.md` with frontmatter schema

**Checkpoint**: Foundation ready - Content creation can begin in parallel.

## Phase 3: User Story 1 - Structured Learning Journey (Priority: P1)

**Goal**: Enable navigation through the 4 core modules and weekly schedule.

**Independent Test**: Verify sidebar navigation links all modules correctly.

### Implementation for User Story 1

- [x] T014 [P] [US1] Create Module 1 (ROS 2) index and initial chapters in `docs/modules/module-1-ros2/`
- [x] T015 [P] [US1] Create Module 2 (Gazebo/Unity) index and initial chapters in `docs/modules/module-2-gazebo-unity/`
- [x] T016 [P] [US1] Create Module 3 (Isaac) index and initial chapters in `docs/modules/module-3-isaac/`
- [x] T017 [P] [US1] Create Module 4 (VLA) index and initial chapters in `docs/modules/module-4-vla/`
- [x] T018 [US1] Update `sidebars.ts` to link all created module content (Topic-based view)
- [x] T019 [P] [US1] Create Week 01-13 placeholder pages linking to relevant module chapters
- [x] T020 [US1] Create Hardware Guide pages (3 Robot Lab, Ether Lab, Jetson Kit) in `docs/hardware/`

## Phase 4: User Story 2 - Hands-on Coding Practice (Priority: P1)

**Goal**: Provide syntax-highlighted code examples for students to execute.

**Independent Test**: Verify code blocks render with correct syntax highlighting and copy button.

### Implementation for User Story 2

- [x] T021 [P] [US2] Add ROS 2 (C++/Python) code snippets to Module 1 chapters
- [x] T022 [P] [US2] Add Gazebo (XML/SDF) code snippets to Module 2 chapters
- [x] T023 [P] [US2] Add Isaac (Python/YAML) code snippets to Module 3 chapters
- [x] T024 [P] [US2] Verify Prism syntax highlighting configuration in `docusaurus.config.ts` for `ros2`, `bash`, `python`, `cpp`, `yaml`

## Phase 5: User Story 3 - Visual Reference for Instructors (Priority: P2)

**Goal**: Provide high-quality diagrams for teaching concepts.

**Independent Test**: Verify diagrams render correctly and are responsive.

### Implementation for User Story 3

- [x] T025 [P] [US3] Create "Robotic Nervous System" Mermaid diagram in Module 1
- [x] T026 [P] [US3] Create "Digital Twin" architecture Mermaid diagram in Module 2
- [x] T027 [P] [US3] Add placeholder images for complex hardware diagrams in `docs/hardware/`
- [x] T028 [US3] Verify mobile responsiveness of all added diagrams

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ensure quality, performance, and SEO requirements are met.

- [ ] T029 Run markdown linting across all docs and fix violations
- [ ] T030 Validate all internal and external links
- [ ] T031 Verify metadata (title, description) exists for all pages
- [ ] T032 Optimize images in `static/img` (convert large PNGs to WebP if needed)
- [ ] T033 Run production build (`npm run build`) and verify no errors
- [ ] T034 Check Lighthouse performance score (FCP < 1.5s)

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Blocks everything.
- **Foundational (Phase 2)**: Blocks content creation (Phase 3+).
- **User Stories (Phase 3-5)**:
  - US1 (Structure) should be largely complete before deep diving into US2 (Code) and US3 (Diagrams), though parallel work is possible on a per-module basis.
- **Polish (Phase 6)**: Run continuously or at the end.

### Parallel Opportunities

- **T001-T007**: Most setup tasks can be done by one person, but configuration files can be prepared in parallel.
- **T014-T017**: Content for different modules can be written completely in parallel by different authors.
- **T021-T023**: Code snippets can be added by technical leads while others write text.
- **T025-T027**: Diagram creation can be assigned to a designer/instructor independently.

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. **Skeleton**: Setup + Foundation + Module Structure (US1)
2. **Content**: Populate Module 1 fully with text and code (US2)
3. **Verify**: Build and deploy Module 1 as a proof of concept.

### Incremental Delivery

1. **Week 1**: Setup, Foundation, Module 1 Draft.
2. **Week 2**: Module 2 Draft, Module 1 Polish.
3. **Week 3**: Module 3 & 4 Drafts.
4. **Final**: Polish, Review, and Launch.
