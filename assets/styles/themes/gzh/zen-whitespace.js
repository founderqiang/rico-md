/**
 * 留白禅意风 — breathing-space essay components (centered serif quotes,
 * hairline chapter marks, numbered 要点 rows). Upstream: theme-zen-whitespace.md.
 */
import { applyComponentFlow } from './engine.js';
import {
  sec, p, sp, leaf, px, moveChildren, buildCtaCard, chapterOrdinal, SANS, SERIF
} from './shared.js';

const GREEN = '#4A5D52';
const HAIRLINE = '#E8E8E8';

function introQuote(quote, { scale }) {
  const doc = quote.ownerDocument;
  const paras = Array.from(quote.children).filter((child) => child.tagName === 'P');
  let signature = null;
  if (paras.length > 1) {
    const lastText = (paras[paras.length - 1].textContent || '').trim();
    if (lastText.startsWith('——') && lastText.length <= 20) {
      signature = paras.pop().textContent.trim();
    }
  }

  const card = sec(doc, 'margin:32px 16px 48px;padding:40px 24px;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;text-align:center;');
  (paras.length > 0 ? paras : [quote]).forEach((para) => {
    const line = p(doc, `font-family:${SERIF};font-size:${px(19, scale)};font-weight:600;color:#2B2B2B;margin:0 0 28px;line-height:1.85;letter-spacing:0.8px;`);
    moveChildren(para, line);
    card.appendChild(line);
  });
  if (signature) {
    card.appendChild(p(doc, `font-size:${px(12, scale)};color:#A3A3A3;margin:0;letter-spacing:1.5px;`, doc.createTextNode(signature)));
  } else {
    const lastLine = card.lastElementChild;
    if (lastLine) lastLine.setAttribute('style', lastLine.getAttribute('style').replace('margin:0 0 28px;', 'margin:0;'));
  }
  return card;
}

function toc(items, { scale, doc }) {
  const cells = items.slice(0, 3).map((item, index) => {
    const style = index === 2
      ? 'flex:1;padding:18px 0;border-bottom:1px solid #E8E8E8;'
      : 'flex:1;padding:18px 12px 18px 0;border-bottom:1px solid #E8E8E8;border-right:1px solid #E8E8E8;margin-right:16px;';
    return sec(doc, style,
      p(doc, `font-size:${px(11, scale)};color:${GREEN};font-weight:600;margin:0 0 6px;letter-spacing:1px;`, doc.createTextNode(item.number)),
      p(doc, `font-size:${px(13, scale)};color:#2B2B2B;margin:0;font-weight:500;line-height:1.5;`, doc.createTextNode(item.title)));
  });
  return sec(doc, 'padding:0 16px 48px;',
    p(doc, `font-size:${px(11, scale)};color:#A3A3A3;margin:0 0 20px;letter-spacing:2px;text-transform:uppercase;`, doc.createTextNode('本文脉络')),
    sec(doc, 'border-top:1px solid #E8E8E8;',
      sec(doc, 'display:flex;', cells)));
}

function chapter(h2, { index, isLast, number, tag, scale }) {
  const doc = h2.ownerDocument;
  const tagLine = isLast ? '∞ · POSTSCRIPT' : `${number} · ${tag || `CHAPTER ${chapterOrdinal(index)}`}`;
  h2.setAttribute('style', `font-family:${SERIF};font-size:${px(22, scale)};font-weight:700;color:#2B2B2B;margin:0 0 16px;letter-spacing:0.5px;line-height:1.4;`);

  return sec(doc, `margin:${index === 0 ? '64px' : '64px'} 0 32px;padding:0 16px;`,
    p(doc, `font-size:${px(10, scale)};color:${GREEN};font-weight:600;letter-spacing:4px;margin:0 0 10px;text-transform:uppercase;`, doc.createTextNode(tagLine)),
    h2,
    sec(doc, 'width:40px;height:2px;background:#4A5D52;', leaf(doc))
  );
}

function h3sub(h3, { scale }) {
  h3.setAttribute('style', `margin:28px 0 14px;border-left:3px solid ${GREEN};padding-left:12px;font-size:${px(16, scale)};font-weight:700;color:#2B2B2B;line-height:1.5;font-family:${SANS};`);
  return h3;
}

function blockQuote(quote, { scale }) {
  const doc = quote.ownerDocument;
  const card = sec(doc, 'margin:40px 16px;padding:36px 20px;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;text-align:center;');
  moveChildren(quote, card);
  Array.from(card.children).filter((child) => child.tagName === 'P').forEach((para, index, all) => {
    para.setAttribute('style', `font-family:${SERIF};font-size:${px(17, scale)};font-weight:600;color:#2B2B2B;margin:${index === all.length - 1 ? '0' : '0 0 16px'};line-height:1.9;letter-spacing:0.8px;`);
  });
  return card;
}

function buildRows(doc, scale, list, ordered) {
  const rows = Array.from(list.children).filter((child) => child.tagName === 'LI');
  const container = sec(doc, 'margin:0 16px 32px;border-top:1px solid #E8E8E8;');
  rows.forEach((item, index) => {
    const row = sec(doc, 'display:flex;align-items:baseline;padding:16px 0;border-bottom:1px solid #E8E8E8;');
    row.appendChild(p(doc, `font-size:${px(11, scale)};color:${GREEN};font-weight:600;letter-spacing:1px;margin:0;min-width:28px;`,
      doc.createTextNode(ordered ? String(index + 1).padStart(2, '0') : '·')));
    const content = p(doc, `font-size:${px(14, scale)};color:#2B2B2B;margin:0;line-height:1.7;padding-left:12px;`);
    moveChildren(item, content);
    row.appendChild(content);
    container.appendChild(row);
  });
  return [container];
}

function divider(rule, { isLast, scale }) {
  const doc = rule.ownerDocument;
  if (!isLast) {
    return sec(doc, 'padding:0 16px;',
      sec(doc, 'height:1px;background:#E8E8E8;margin:64px 0 0;', leaf(doc)));
  }
  return sec(doc, 'padding:0 16px;',
    sec(doc, 'text-align:center;margin:48px 0 40px;',
      sec(doc, 'display:flex;align-items:center;justify-content:center;',
        sp(doc, 'height:1px;width:48px;background:#E8E8E8;margin-right:16px;', leaf(doc)),
        sp(doc, `font-size:${px(10, scale)};color:#A3A3A3;letter-spacing:4px;font-weight:400;`, doc.createTextNode('END')),
        sp(doc, 'height:1px;width:48px;background:#E8E8E8;margin-left:16px;', leaf(doc))
      )
    )
  );
}

function cta({ scale, doc, displaySettings }) {
  return buildCtaCard(doc, scale, {
    card: 'border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;padding:36px 20px;text-align:center;margin:0 16px 40px;',
    box: 'background:#FFFFFF;border:1px solid #E8E8E8;border-radius:50%;',
    accentBox: 'background:#EEF3F0;border:1px solid #B5C8BC;border-radius:50%;',
    iconColor: '#525252',
    accentColor: GREEN,
    leadColor: '#2B2B2B',
    interaction: displaySettings,
    leadWeight: 600,
    thirdLabel: '转发',
    footer: p(doc, 'font-size:10px;color:#A3A3A3;letter-spacing:2px;margin:0;', doc.createTextNode('END'))
  });
}

export const zenWhitespaceTheme = {
  name: '留白禅意风',
  preserveQuoteColors: true,
  styles: {
    container: `max-width:677px;box-sizing:border-box;margin:0 auto;padding:16px 0 40px;background-color:#FFFFFF !important;color:#525252 !important;font-family:${SANS};line-height:1.9;letter-spacing:0.3px;overflow-wrap:anywhere;`,
    h1: `margin:32px 16px 48px;padding:0;font-family:${SERIF};font-size:22px;font-weight:600;line-height:1.6;color:#2B2B2B !important;text-align:center;letter-spacing:1px;`,
    h2: `margin:64px 0 32px;padding:0 16px;font-family:${SERIF};font-size:22px;font-weight:700;line-height:1.4;color:#2B2B2B !important;`,
    h3: `margin:28px 0 14px;padding:0 16px 0 12px;border-left:3px solid ${GREEN};font-family:${SANS};font-size:16px;font-weight:700;line-height:1.5;color:#2B2B2B !important;`,
    h4: `margin:24px 0 12px;padding:0 16px;font-size:16px;font-weight:700;line-height:1.5;color:#2B2B2B !important;`,
    h5: `margin:20px 0 10px;padding:0 16px;font-size:15px;font-weight:600;color:#2B2B2B !important;`,
    h6: `margin:18px 0 10px;padding:0 16px;font-size:13px;font-weight:600;color:#A3A3A3 !important;`,
    p: 'margin:0 0 26px;padding:0 16px;font-size:15px;line-height:1.9;text-align:justify;color:#525252 !important;',
    strong: `font-weight:600;color:${GREEN} !important;`,
    em: 'font-style:italic;color:#737373 !important;',
    a: `color:${GREEN} !important;text-decoration:underline;overflow-wrap:break-word;`,
    u: 'text-decoration:none;border-bottom:1.5px solid #B5C8BC;font-weight:500;',
    mark: 'background-color:#EEF3F0;color:#3D5046;padding:2px 6px;border-radius:2px;font-weight:600;',
    s: 'color:#A3A3A3;text-decoration:line-through;',
    ul: 'margin:0 0 26px;padding:0 16px;',
    ol: 'margin:0 0 26px;padding:0 16px;',
    li: 'margin:8px 0;font-size:15px;line-height:1.9;color:#2B2B2B !important;',
    'li p': 'margin:6px 0;',
    blockquote: 'margin:40px 16px;padding:36px 20px;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;text-align:center;',
    'blockquote p': `margin:0 0 16px;font-family:${SERIF};font-size:17px;font-weight:600;color:#2B2B2B !important;`,
    code: `font-family:${SERIF};font-size:14px;padding:2px 6px;border-radius:2px;background-color:#EEF3F0;color:#3D5046;font-weight:600;`,
    pre: `margin:32px 0;padding:16px;background-color:#FFFFFF;color:#3D5046;border:1px solid #E8E8E8;border-radius:0;overflow-x:auto;line-height:1.8;`,
    hr: 'margin:64px 0 0;border:0;border-top:1px solid #E8E8E8;',
    img: 'display:block;max-width:100%;height:auto;margin:32px auto;border:1px solid #E8E8E8;border-radius:0;',
    table: 'width:100%;border-collapse:collapse;font-size:14px;',
    th: 'padding:12px;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;text-align:left;color:#2B2B2B;font-weight:600;',
    td: 'padding:12px;border-bottom:1px solid #E8E8E8;color:#525252;line-height:1.8;',
    tr: 'border:0;'
  },
  transform(doc, ctx) {
    applyComponentFlow(doc, ctx, {
      toc,
      chapter,
      h3sub,
      introQuote,
      quote: blockQuote,
      unorderedList: (ul, options) => buildRows(options.doc, options.scale, ul, false),
      orderedList: (ol, options) => buildRows(options.doc, options.scale, ol, true),
      divider,
      cta
    });
  }
};
