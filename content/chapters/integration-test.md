---
title: "Integration Test Chapter"
subtitle: "Testing the end-to-end pipeline"
thread: renergence
tier: depth
author: "Steven Rudolph"
book: "Design System Test"
chapter_number: 1
date: 2026-02-09
---

# Integration Test Chapter

This chapter tests the complete pipeline from design tokens to formatted output.

## Section One: Typography

This section demonstrates how typography tokens cascade through the system. We're testing that font families, sizes, and spacing all come from the design token source.

**Key insight:** A single source of truth means one change updates everything.

## Section Two: Colors and Styling

The thread colors and text hierarchy should be applied consistently:

- Primary text: `--text-primary`
- Secondary text: `--text-secondary`
- Thread background: `--thread-renergence`

## Section Three: Lists and Structure

Ordered list:
1. First item
2. Second item
3. Third item

Unordered list:
- Design tokens define values
- Converters generate format-specific stylesheets
- Pandoc applies styles during build

> **Blockquote styling:** This should be styled with the accent border from the design system.

## Conclusion

If you can read this with proper styling in epub/pdf/docx, the pipeline is working correctly.
