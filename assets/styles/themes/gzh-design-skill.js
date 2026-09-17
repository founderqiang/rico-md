/**
 * gzh-design-skill theme pack for Rico MD's Markdown renderer.
 * Component-level restorations of isjiamu/gzh-design-skill themes.
 * Copyright (C) 2026 Jiamu × Moyu Xiaoli.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * See docs/gzh-design-skill.md and licenses/gzh-design-skill.txt.
 *
 * Each theme pairs a per-element `styles` map (typography, inline marks,
 * tables, code) with a `transform(doc, ctx)` hook — invoked by
 * render-pipeline.js — that reassembles headings, quotes, lists and rules
 * into the upstream component structures (cover cards, numbered PART
 * headers, quote cards, pill lists …).
 *
 * Authoring conventions:
 *   # 主标题｜副标题        — the suffix feeds the cover kicker/subtitle
 *   ## 章节｜ENGLISH TAG    — the suffix becomes the chapter's tag line
 *   > 开头的引用            — the first preface blockquote becomes the intro card
 *   <u>关键词</u>           — the theme's signature keyword underline
 */
import { moyuGreenTheme } from './gzh/moyu-green.js';
import { redWhiteTheme } from './gzh/red-white.js';
import { graphiteMinimalTheme } from './gzh/graphite-minimal.js';
import { zenWhitespaceTheme } from './gzh/zen-whitespace.js';
import { moyuTicketTheme } from './gzh/moyu-ticket.js';
import { oliveJournalTheme } from './gzh/olive-journal.js';
import { monoBlueEditorialTheme } from './gzh/mono-blue-editorial.js';

// Upstream (isjiamu/gzh-design-skill) ends every produced article with a
// hidden `<mp-style-type data-value="3">` marker. It tells the WeChat editor
// to treat the pasted fragment as one style module and keep the component
// structure verbatim; without it the editor's paste normalization rebuilds
// the section components and inserts stray empty lines between them.
// clipboard-exporter.js consumes this flag when copying to 公众号.
const withWechatStyleModule = (theme) => ({ ...theme, wechatStyleModule: true });

export const GZH_DESIGN_THEMES = {
  'gzh-moyu-green': withWechatStyleModule(moyuGreenTheme),
  'gzh-red-white': withWechatStyleModule(redWhiteTheme),
  'gzh-graphite-minimal': withWechatStyleModule(graphiteMinimalTheme),
  'gzh-zen-whitespace': withWechatStyleModule(zenWhitespaceTheme),
  'gzh-moyu-ticket': withWechatStyleModule(moyuTicketTheme),
  'gzh-olive-journal': withWechatStyleModule(oliveJournalTheme),
  'gzh-mono-blue-editorial': withWechatStyleModule(monoBlueEditorialTheme)
};
