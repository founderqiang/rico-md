/**
 * Shared DOM-transform helpers for gzh-design-skill component themes.
 * Based on isjiamu/gzh-design-skill, Copyright (C) 2026 Jiamu × Moyu Xiaoli.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Themes in this folder are not plain per-element style maps: each exposes a
 * `transform(doc, ctx)` hook (invoked by render-pipeline after inline styles)
 * that reassembles standard markdown elements into the component structures
 * used by the upstream skill (cover cards, numbered PART headers, quote cards,
 * pill lists, numbered circles …), following its WeChat compatibility rules:
 * decorative empty elements carry a leaf placeholder, no font-size on <strong>,
 * one font-size per <p>, structure built from <section>/<span> only.
 */

export const SANS = "-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
export const SERIF = "'Noto Serif SC','Songti SC',STSong,Georgia,'Times New Roman',serif";
export const MONO = "Consolas,Menlo,Monaco,'Courier New',monospace";

const ORDINALS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];

/** Create an element with an inline style string. */
export function el(doc, tag, style, ...children) {
  const node = doc.createElement(tag);
  if (style) node.setAttribute('style', style);
  children.flat().filter(Boolean).forEach((child) => node.appendChild(child));
  return node;
}

export function sec(doc, style, ...children) { return el(doc, 'section', style, ...children); }
export function p(doc, style, ...children) { return el(doc, 'p', style, ...children); }
export function sp(doc, style, ...children) { return el(doc, 'span', style, ...children); }

/** WeChat-safe placeholder for decorative empty elements: <span leaf=""><br></span> */
export function leaf(doc) {
  const span = doc.createElement('span');
  span.setAttribute('leaf', '');
  span.appendChild(doc.createElement('br'));
  return span;
}

/** Scale a px value by the current font scale. */
export function px(size, scale = 1) {
  return `${Math.round(size * scale * 100) / 100}px`;
}

/** Split `标题｜英文标签` / `标题 | english tag` into title + tag. */
export function splitHeadingText(text) {
  const raw = String(text || '').trim();
  const match = raw.match(/^(.+?)[｜|]\s*(.+)$/);
  if (!match) return { title: raw, tag: '' };
  return { title: match[1].trim(), tag: match[2].trim() };
}

/**
 * Split a cover title into positional or named metadata.
 * Positional syntax remains compatible: `主标题 | 标签 | 署名 | 日期 | 作者`.
 * Named syntax lets every cover replace its optional masthead copy, e.g.
 * `主标题 | label=刊头 | subtitle=摘要 | summary=简短导语 | issue=第09期 | footer=署名`.
 */
export function splitCoverHeadingText(text) {
  const parts = String(text || '')
    .split(/[｜|]/)
    .map((part) => part.trim());
  const named = {};
  const positional = [];

  parts.slice(1).forEach((part) => {
    const match = part.match(/^([a-zA-Z][\w-]*)\s*=\s*(.*)$/);
    if (match) named[match[1]] = match[2].trim();
    else positional.push(part);
  });

  return {
    title: parts[0] || '',
    tag: named.tag || positional[0] || '',
    label: named.label || '',
    subtitle: named.subtitle || '',
    summary: named.summary || named.description || '',
    coverImage: named.coverImage || named.coverimage || '',
    footer: named.footer || positional[1] || '',
    footerRight: named.footerRight || named.footerright || '',
    date: named.date || positional[2] || '',
    author: named.author || positional.slice(3).filter(Boolean).join(' | '),
    authorBio: named.authorBio || named.authorbio || '',
    stars: named.stars || '',
    issue: named.issue || '',
    aside: named.aside || '',
    grade: named.grade || '',
    tags: named.tags || ''
  };
}

/** Zero-padded chapter number, e.g. 1 -> "01". */
export function chapterNumber(index) {
  return String(index + 1).padStart(2, '0');
}

/** English ordinal for zen chapter tags: 0 -> ONE … */
export function chapterOrdinal(index) {
  return ORDINALS[index] || `CHAPTER ${index + 1}`;
}

/**
 * Collect inline nodes (text + elements) of a list item up to its first
 * block-level child, used to split pill labels from descriptions.
 */
export function inlineContentOf(node) {
  const nodes = [];
  while (node.firstChild && node.firstChild.nodeType !== 1) {
    nodes.push(node.removeChild(node.firstChild));
  }
  return nodes;
}

/**
 * Split list-item text into a short label and an optional description at the
 * first colon. Returns { label, description, descriptionNodes } — description
 * empty when the item is label-only, label empty when the item is too long
 * to pill-ify. When the label is plain leading text, descriptionNodes keeps
 * the item's inline elements (links, strong, code …) intact instead of
 * flattening them to text; otherwise it is null and callers fall back to the
 * plain-text description.
 */
export function splitListItem(item) {
  const clone = item.cloneNode(true);
  clone.querySelectorAll('p').forEach((child) => {
    const parent = child.parentNode;
    while (child.firstChild) parent.insertBefore(child.firstChild, child);
    parent.removeChild(child);
  });
  const text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
  const colon = text.match(/^(.{1,14}?)\s*[：:]\s*(.+)$/);
  if (colon) {
    let descriptionNodes = null;
    // Strip the `label：` prefix from the live clone when it lives entirely
    // in a leading text node, so the rest of the item can be moved as nodes.
    const first = clone.firstChild;
    if (first && first.nodeType === 3) {
      const stripped = first.nodeValue.replace(/^\s*[^：:]{1,14}?\s*[：:]\s*/, '');
      if (first.nodeValue !== stripped && !/^[：:]/.test(stripped)) {
        first.nodeValue = stripped;
        descriptionNodes = Array.from(clone.childNodes).filter((node) => {
          if (node.nodeType !== 3) return true;
          return Boolean((node.nodeValue || '').trim());
        });
        if (descriptionNodes.length === 0) descriptionNodes = null;
      }
    }
    return { label: colon[1], description: colon[2], descriptionNodes };
  }
  if (text.length <= 12) return { label: text, description: '', descriptionNodes: null };
  return { label: '', description: text, descriptionNodes: null };
}

/** All direct children of body matching a predicate. */
export function bodyChildren(doc, predicate) {
  return Array.from(doc.body.children).filter(predicate);
}

export function isHeading(tagName) {
  return /^H[1-6]$/.test(tagName || '');
}

/**
 * True when the element sits between document start (or the h1) and the
 * first h2 — the “前言” region where the opening quote card lives.
 */
export function isInPreface(node) {
  let sibling = node.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === 'H2' || sibling.tagName === 'H1') return sibling.tagName === 'H1';
    sibling = sibling.previousElementSibling;
  }
  return true;
}

/** Current date as YYYY.MM for cover stamps. */
export function currentDateStamp() {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Paragraphs of a blockquote, with a trailing “—— xxx” line peeled off. */
export function extractQuoteParts(blockquote) {
  const paras = Array.from(blockquote.querySelectorAll('p'));
  if (paras.length === 0) {
    return { body: [blockquote], signature: null };
  }
  let signature = null;
  const last = paras[paras.length - 1];
  const lastText = (last.textContent || '').trim();
  if (paras.length > 1 && /^——|^——/.test(lastText) && lastText.length <= 20) {
    signature = lastText;
    paras.pop();
  }
  return { body: paras, signature };
}

/** Recursively move all children from one node into another. */
export function moveChildren(from, to) {
  while (from.firstChild) to.appendChild(from.firstChild);
}

/** Wrap `heading` (keeping it for TOC anchors) inside a built container. */
export function restyleHeading(heading, style) {
  heading.setAttribute('style', style);
  return heading;
}

/**
 * Build the shared footer CTA card skeleton (点赞/在看/星标 icons +
 * THANKS FOR READING), themed through `skin`.
 */
export function buildCtaCard(doc, scale, skin) {
  const interaction = skin.interaction || {};
  const icons = [
    { label: interaction.footerCtaLikeLabel || '点赞', svg: '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>', accent: false },
    { label: interaction.footerCtaReadLabel || '在看', svg: '<circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>', accent: false },
    { label: interaction.footerCtaShareLabel || skin.thirdLabel || '转发', svg: skin.thirdIcon || '<path d="M4 18v-4a8 8 0 0 1 8-8h8"></path><polyline points="16 2 20 6 16 10"></polyline>', accent: true }
  ];

  const iconNodes = icons.map((icon) => {
    const box = sec(doc,
      `width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;${icon.accent ? skin.accentBox : skin.box}`,
      iconSvg(doc, icon.svg, icon.accent ? skin.accentColor : undefined));
    return sec(doc, `text-align:center;${icon.accent ? `color:${skin.accentColor};` : `color:${skin.iconColor};`}`,
      box,
      sp(doc, `font-size:${px(10, scale)};font-weight:600;`, doc.createTextNode(icon.label)));
  });

  const card = sec(doc, skin.card,
    p(doc, `font-size:${px(skin.fontSize || 13, scale)};font-weight:${skin.leadWeight || 700};color:${skin.leadColor};margin:0 0 20px;line-height:1.6;text-align:center;`,
      doc.createTextNode(interaction.footerCtaLead || skin.leadText || '既然看到这里了，如果觉得有用，随手点个赞、在看、转发三连吧。')),
    sec(doc, 'display:flex;justify-content:center;gap:24px;margin-bottom:16px;', iconNodes),
    skin.footer || null);
  return card;
}

function iconSvg(doc, paths, color) {
  const wrapper = doc.createElement('span');
  wrapper.setAttribute('style', 'display:inline-flex;line-height:0;');
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  if (color) svg.setAttribute('style', `color:${color};`);
  wrapper.appendChild(svg);
  const parsed = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${paths}</svg>`, 'image/svg+xml');
  Array.from(parsed.documentElement.childNodes).forEach((childNode) => {
    svg.appendChild(doc.importNode(childNode, true));
  });
  return wrapper;
}
