/**
 * Generic component-transform flow shared by all gzh-design-skill themes.
 * Collects the markdown-level blocks (h1, h2, h3, blockquote, ul, ol, hr)
 * and hands each to a theme-specific builder that returns replacement nodes.
 * Real h1/h2/h3 elements are kept (restyled) inside the built components so
 * the editor outline and heading scroll keep working.
 */
import { splitCoverHeadingText, splitHeadingText, chapterNumber } from './shared.js';

/**
 * Replace a source block with a component without assuming the builder left
 * the source in its original parent. Several component builders deliberately
 * move the real heading/quote into their returned wrapper to preserve the
 * document outline. In that case `replaceChild(wrapper, source)` is invalid:
 * the wrapper already contains source. Keep the original insertion point and
 * insert the wrapper there instead.
 */
function replaceBlock(source, replacement, parent, nextSibling) {
  if (!replacement || replacement === source || !parent) return;

  if (replacement.contains(source)) {
    parent.insertBefore(replacement, nextSibling);
    return;
  }

  parent.replaceChild(replacement, source);
}

export function applyComponentFlow(doc, ctx, handlers) {
  const scale = ctx.fontScale || 1;
  const body = doc.body;

  const h1 = Array.from(body.children).find((child) => child.tagName === 'H1') || null;
  const chapters = Array.from(body.children).filter((child) => child.tagName === 'H2');
  const hrs = Array.from(body.children).filter((child) => child.tagName === 'HR');
  const lists = Array.from(body.children).filter((child) => child.tagName === 'UL' || child.tagName === 'OL');
  const quotes = Array.from(body.children).filter((child) => child.tagName === 'BLOCKQUOTE');

  if (handlers.cover && h1) {
    const parent = h1.parentNode;
    const nextSibling = h1.nextSibling;
    const coverText = splitCoverHeadingText(h1.textContent);
    h1.textContent = coverText.title;
    const node = handlers.cover(h1, { scale, ...coverText, doc });
    replaceBlock(h1, node, parent, nextSibling);
  }

  if (handlers.toc && chapters.length >= (handlers.tocMinChapters ?? 3)) {
    const items = chapters.map((chapter, index) => {
      const { title, tag } = splitHeadingText(chapter.textContent);
      return { title: title || `第 ${index + 1} 节`, tag, number: chapterNumber(index) };
    });
    const node = handlers.toc(items, { scale, doc });
    if (node) chapters[0].parentNode.insertBefore(node, chapters[0]);
  }

  chapters.forEach((chapter, index) => {
    if (!handlers.chapter) return;
    const parent = chapter.parentNode;
    const nextSibling = chapter.nextSibling;
    const { title, tag } = splitHeadingText(chapter.textContent);
    // The right side of `标题 | 要点` belongs to the component's supporting
    // label, not to the visible H2 itself. Without this normalization it was
    // rendered twice: once inside the heading and again as the label.
    if (tag) chapter.textContent = title;
    const node = handlers.chapter(chapter, {
      index,
      total: chapters.length,
      isLast: index === chapters.length - 1,
      number: chapterNumber(index),
      title,
      tag,
      scale,
      doc
    });
    replaceBlock(chapter, node, parent, nextSibling);
  });

  Array.from(body.children).filter((child) => child.tagName === 'H3').forEach((sub) => {
    if (!handlers.h3sub) return;
    const parent = sub.parentNode;
    const nextSibling = sub.nextSibling;
    const node = handlers.h3sub(sub, { scale, doc });
    replaceBlock(sub, node, parent, nextSibling);
  });

  quotes.forEach((quote, index) => {
    const parent = quote.parentNode;
    const nextSibling = quote.nextSibling;
    const inPreface = !chapters.some((chapter) => chapter.compareDocumentPosition(quote) & Node.DOCUMENT_POSITION_FOLLOWING);
    const intro = index === 0 && inPreface && handlers.introQuote;
    const node = intro
      ? handlers.introQuote(quote, { scale, doc })
      : (handlers.quote ? handlers.quote(quote, { scale, doc }) : null);
    replaceBlock(quote, node, parent, nextSibling);
  });

  lists.forEach((list) => {
    const builder = list.tagName === 'OL' ? handlers.orderedList : handlers.unorderedList;
    if (!builder) return;
    const nodes = builder(list, { scale, doc });
    if (!nodes) return;
    const fragment = doc.createDocumentFragment();
    (Array.isArray(nodes) ? nodes : [nodes]).forEach((node) => fragment.appendChild(node));
    list.parentNode.replaceChild(fragment, list);
  });

  hrs.forEach((rule, index) => {
    if (!handlers.divider) return;
    const node = handlers.divider(rule, { isLast: index === hrs.length - 1, scale, doc });
    if (node && node !== rule) rule.parentNode.replaceChild(node, rule);
  });

  if (ctx.displaySettings?.footerCta && handlers.cta) {
    const node = handlers.cta({ scale, doc, displaySettings: ctx.displaySettings });
    if (node) body.appendChild(node);
  }
}
