---
name: Đế Chế Web
description: A restrained Vietnamese workbench around the live Viva La RTS game.
colors:
  charcoal: "#181a19"
  panel: "#202320"
  divider: "#363b35"
  ivory: "#f1eee5"
  muted: "#aeb4a8"
  bronze: "#c6a373"
typography:
  title:
    fontFamily: "Segoe UI, Tahoma, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 400
    letterSpacing: "-0.5px"
  body:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.65
  label:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "13px"
rounded:
  control: "5px"
  input: "4px"
  confirmation: "8px"
spacing:
  action-gap: "8px"
  page-inline: "24px"
  drawer-inline: "28px"
components:
  button-default:
    textColor: "{colors.ivory}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  button-primary:
    backgroundColor: "{colors.bronze}"
    textColor: "#191b18"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  search-field:
    backgroundColor: "#181c18"
    textColor: "{colors.ivory}"
    rounded: "{rounded.input}"
    padding: "11px 12px"
---

# Design System: Đế Chế Web

## Overview

**Creative North Star: "Game-first workbench"**

The actual Viva La RTS game supplies the visual interest. The owned interface is a quiet, compact Vietnamese workbench: a control row, a large game viewport, a status line and an optional help drawer. Charcoal surfaces, ivory text and small bronze accents support play without competing with it.

This records the implemented wrapper in index.html and style.css, rather than the third-party game's internal design. There is no approved image comp: the current interface is code-led. The confirmed direction rejects a landing-page grid and generated decorative artwork.

**Key Characteristics:**
- Game-dominant viewport.
- Restrained native controls.
- Readable Vietnamese system typography.
- Help available on demand.

## Colors

The palette is subdued, slightly green charcoal with a warm bronze accent.

### Primary
- **Bronze:** icons, focus outlines, numbered instructions, links and the reload confirmation action. Its exact token is in the frontmatter.

### Neutral
- **Charcoal:** the overall player shell.
- **Panel:** the help and confirmation dialogs.
- **Divider:** thin boundaries between structural regions and controls.
- **Ivory:** primary copy.
- **Muted:** explanatory copy and status information.

**The Game Leads Rule.** Keep the wrapper subdued so the live game remains the strongest visual surface.

## Typography

The base font is Segoe UI with Arial and sans-serif fallbacks. Drawer headings additionally include Tahoma. These are system fonts; no webfont is loaded. Preserve Vietnamese diacritics and ordinary-language labels.

The drawer title uses the frontmatter title role, reducing to 28px on narrow screens. Help body copy uses the body role; secondary explanations are 13px. Toolbar labels use the label role on desktop, reducing to 11px on small screens. The brand is 20px at weight 650 on desktop and 17px on narrow screens; its small uppercase source label is intentionally subordinate. Status copy is 11px, reducing to 10px on small screens.

## Layout

The player fills the viewport using 100vh with a 100dvh override. A flex column gives all remaining space to the game iframe. The desktop toolbar has a minimum height of 78px; the status bar has a minimum height of 44px. These are minimums rather than fixed clipping boxes.

At 820px and below, margins and control spacing tighten and a landscape/mouse advisory appears. At 580px and below, branding and actions wrap into two rows. Action controls retain a 44px minimum target height. The help drawer sits against the right edge at a maximum width of 470px and fills the width on narrower viewports. Its content scrolls independently. In landscape at heights of 500px or below, toolbar and status padding compress and the advisory hides.

**The Available Space Rule.** New wrapper content must preserve the flexible game region instead of pushing the game below a promotional section.

## Elevation & Depth

Depth comes from tonal surfaces, one-pixel borders and the modal backdrop, which is black at 64% opacity. No decorative shadows, blur or gradient system exists. Opening help dims the game behind it. There are no animated transitions; reduced-motion rules explicitly disable animations and transitions.

## Shapes

Controls have modest rounding, fields slightly tighter rounding, and the confirmation dialog softer rounding. The edge-attached help drawer remains square. Icons are simple inline SVG strokes with no filled badges. The status indicator is a small circular dot, green for the ordinary state and bronze for a notice; its accompanying text communicates status.

## Components

- **Toolbar and actions:** a compact brand at left and a restrained action row at right. On mobile the actions occupy a second row. Outlined buttons gain a darker green charcoal fill and lighter border on hover. The separate-tab link has a left divider.
- **Focus treatment:** buttons, links, inputs and disclosure summaries use a bronze 2px outline offset by 4px. Preserve this visible keyboard state.
- **Help drawer:** an edge-attached native dialog, plain title, 44px close control, numbered instructions, native disclosures and searchable bilingual terms. Dividers organize content instead of cards.
- **Search field:** full-width dark field with a thin border, readable muted placeholder and bronze caret. Results use two plain columns with row separators.
- **Reload confirmation:** a compact centered native dialog with ordinary and bronze action buttons. The emphasized action is reserved for the explicit reload choice.
- **Status line:** low-emphasis text and a dot under the game. Do not imply that loading the iframe proves the player has started a match.

## Do's and Don'ts

### Do:
- Do let the actual game lead the screen.
- Do use natural Vietnamese and preserve visible keyboard focus.
- Do keep support in the optional drawer and preserve usable control targets.

### Don't:
- Don't introduce a landing grid or generated decorative art.
- Don't claim the wrapper controls or translates the third-party game's internal menu.
- Don't treat portrait mobile presentation as evidence of comfortable touch gameplay.
