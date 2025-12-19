# Quickstart: Physical AI & Humanoid Robotics Textbook

**Feature**: `001-robotics-textbook`
**Date**: 2025-12-07

## Prerequisites

- Node.js version 18.0 or above:
  ```bash
  node -v
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd humanoid-robotics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the local development server:
```bash
npm start
```
The site will be available at `http://localhost:3000/`.

## Build

Build the static site for production:
```bash
npm run build
```
Output directory: `build/`

## Content Creation

1. Create a new markdown file in `docs/`:
   ```bash
   touch docs/modules/module-1-ros2/new-topic.md
   ```

2. Add frontmatter:
   ```yaml
   ---
   title: New Topic
   description: Description of new topic
   sidebar_position: 1
   ---
   ```

3. Write content using Markdown/MDX.
