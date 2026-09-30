/**
 * Quaily 极简刊 — warm-paper minimal editorial modeled on quaily.com:
 * serif display headings, editor red (#AE1300) as the only accent, flat
 * grey quote cards with 2px corners, double-hairline dividers and dark
 * code blocks. Component flow follows the 摸鱼绿 template.
 * Design spec: 开发/new-themes/quaily.md (+ Quaily.jpg reference).
 */
import { applyComponentFlow } from './engine.js';
import {
  sec, p, sp, leaf, px, splitListItem, moveChildren, moveListItemInline, buildCtaCard, SANS, MONO
} from './shared.js';

const RED = '#AE1300';
const INK = '#181832';
const MUTED = '#6F6A78';
const HAIR = 'rgba(24,24,50,0.14)';
const QUOTE_BG = '#F5F5F5';
const SERIF = "'Noto Serif SC','Songti SC',STSong,Georgia,'Times New Roman',serif";

function pill(doc, scale, label) {
  return sp(doc,
    `display:inline-block;font-size:${px(12, scale)};font-weight:700;color:${RED};background:rgba(174,19,0,0.06);padding:2px 10px;border-radius:2px;vertical-align:middle;`,
    doc.createTextNode(label));
}

function cover(h1, { scale, tag, subtitle, footer, date, author }) {
  const doc = h1.ownerDocument;
  h1.setAttribute('style', `font-size:${px(25, scale)};font-weight:800;color:${INK};margin:0 0 14px;line-height:1.35;letter-spacing:0.5px;font-family:${SERIF};`);

  const hasMeta = footer || author;
  return sec(doc,
    'margin:0 8px 32px;background:#FFFFFF;border:1px solid rgba(24,24,50,0.12);border-radius:2px;overflow:hidden;',
    // quaily.com posts open with a thin focused red rule above the title.
    sec(doc, 'height:3px;background:#AE1300;', leaf(doc)),
    sec(doc, 'padding:26px 24px 22px;',
      sec(doc, 'display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px;',
        tag ? sp(doc, `font-size:${px(11, scale)};font-weight:700;letter-spacing:3px;color:${RED};font-family:${SANS};`, doc.createTextNode(tag)) : null,
        sec(doc, 'flex:1;height:1px;background:rgba(24,24,50,0.12);overflow:hidden;', leaf(doc)),
        date ? sp(doc, `font-size:${px(10, scale)};color:#9A94B8;font-weight:600;font-family:${SANS};letter-spacing:1px;`, doc.createTextNode(date)) : null
      ),
      h1,
      subtitle ? p(doc, `margin:14px 0 0;font-size:${px(13, scale)};line-height:1.7;color:${MUTED};font-family:${SANS};text-align:justify;`, doc.createTextNode(subtitle)) : null
    ),
    hasMeta
      ? sec(doc, 'border-top:1px solid rgba(24,24,50,0.12);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;',
        footer ? p(doc, `font-size:11px;color:${MUTED};margin:0;font-weight:600;letter-spacing:0.5px;font-family:${SANS};`, doc.createTextNode(footer)) : null,
        author ? p(doc, `font-size:11px;color:${INK};margin:0 0 0 auto;font-weight:700;letter-spacing:0.5px;font-family:${SANS};white-space:nowrap;`, doc.createTextNode(author)) : null)
      : null
  );
}

function chapter(h2, { index, number, tag, scale }) {
  const doc = h2.ownerDocument;
  h2.setAttribute('style', `margin:0 0 2px;font-size:${px(19, scale)};font-weight:800;color:${INK};letter-spacing:0.5px;line-height:1.45;font-family:${SERIF};`);

  return sec(doc, `margin:${index === 0 ? '32px' : '44px'} 0 24px;padding:0 8px;`,
    sec(doc, 'display:flex;align-items:baseline;gap:14px;margin-bottom:18px;',
      sp(doc, `font-family:${SERIF};font-size:${px(26, scale)};font-weight:800;color:${RED};line-height:1;flex-shrink:0;`,
        doc.createTextNode(number)),
      sec(doc, 'flex:1;',
        h2,
        tag ? p(doc, `margin:0;font-size:${px(11, scale)};font-weight:400;color:#9A94B8;letter-spacing:1.5px;font-family:${SANS};`, doc.createTextNode(tag)) : null
      )
    ),
    sec(doc, 'height:1px;background:rgba(24,24,50,0.12);overflow:hidden;', leaf(doc))
  );
}

function h3sub(h3, { scale }) {
  const doc = h3.ownerDocument;
  h3.setAttribute('style', `margin:30px 0 14px;padding:0 8px 0 10px;border-left:3px solid ${RED};font-size:${px(16, scale)};font-weight:700;color:${INK};line-height:1.5;font-family:${SERIF};`);
  return h3;
}

function introQuote(quote, { scale }) {
  const doc = quote.ownerDocument;
  const paras = Array.from(quote.children).filter((child) => child.tagName === 'P');
  const card = sec(doc, `background:${QUOTE_BG};border-radius:2px;padding:16px 18px;margin-bottom:24px;`);
  const wrapper = sec(doc, 'margin:0 8px;',
    p(doc, `margin:0 0 8px;font-size:${px(11, scale)};font-weight:700;color:${RED};letter-spacing:2px;font-family:${SANS};`, doc.createTextNode('摘要 SUMMARY')),
    card);

  if (paras.length > 1) {
    paras.slice(0, -1).forEach((para) => {
      const lead = p(doc, `font-size:${px(12, scale)};color:${MUTED};margin:0 0 6px;line-height:1.6;font-family:${SANS};`);
      moveChildren(para, lead);
      card.appendChild(lead);
    });
  }
  const statement = p(doc, 'margin:0;line-height:1.7;');
  const inner = sp(doc, `font-size:${px(15, scale)};color:${INK};font-weight:600;font-family:${SERIF};`);
  const last = paras[paras.length - 1] || quote;
  moveChildren(last, inner);
  statement.appendChild(inner);
  card.appendChild(statement);
  return wrapper;
}

function blockQuote(quote, { scale }) {
  const doc = quote.ownerDocument;
  const card = sec(doc, `background:${QUOTE_BG};border-radius:2px;padding:14px 18px;margin:0 8px 24px;text-align:justify;`);
  moveChildren(quote, card);
  Array.from(card.children).filter((child) => child.tagName === 'P').forEach((para, index, all) => {
    para.setAttribute('style', `font-size:${px(13, scale)};color:#3F3F51;margin:${index === all.length - 1 ? '0' : '0 0 6px'};line-height:1.7;`);
  });
  return card;
}

function unorderedList(ul, { scale }) {
  const doc = ul.ownerDocument;
  return Array.from(ul.children).filter((child) => child.tagName === 'LI').map((item) => {
    const { label, description, descriptionNodes } = splitListItem(item, { shortAsLabel: false });
    const row = sec(doc, 'display:flex;align-items:flex-start;gap:10px;margin:0 8px 12px;');
    const dash = sp(doc, `width:14px;height:2px;background:${RED};flex-shrink:0;margin-top:10px;`, leaf(doc));
    const desc = p(doc, `flex:1;font-size:${px(14, scale)};color:#3F3F51;margin:0;line-height:1.8;text-align:justify;`);
    if (!label) {
      moveListItemInline(item, desc);
    } else {
      desc.appendChild(pill(doc, scale, label));
      desc.appendChild(doc.createTextNode(' '));
      if (descriptionNodes) {
        descriptionNodes.forEach((node) => desc.appendChild(node));
      } else {
        desc.appendChild(doc.createTextNode(description));
      }
    }
    row.appendChild(dash);
    row.appendChild(desc);
    return row;
  });
}

function orderedList(ol, { scale }) {
  const doc = ol.ownerDocument;
  return Array.from(ol.children).filter((child) => child.tagName === 'LI').map((item, index) => {
    const row = sec(doc, 'display:flex;align-items:flex-start;gap:12px;margin:0 8px 12px;');
    const num = sp(doc,
      `font-family:${SERIF};font-size:${px(15, scale)};font-weight:800;color:${RED};flex-shrink:0;line-height:1.9;`,
      doc.createTextNode(`${index + 1}.`));
    const content = p(doc, `font-size:${px(14, scale)};color:#3F3F51;margin:0;line-height:1.9;flex:1;text-align:justify;`);
    moveChildren(item, content);
    row.appendChild(num);
    row.appendChild(content);
    return row;
  });
}

function divider(rule) {
  const doc = rule.ownerDocument;
  // quaily.com renders <hr> as a 4px-tall block with hairline top and
  // bottom borders — a quiet double rule.
  return sec(doc, 'margin:20px 8px;height:4px;border-top:1px solid rgba(24,24,50,0.18);border-bottom:1px solid rgba(24,24,50,0.18);', leaf(doc));
}

function toc(items, { scale, doc }) {
  const rows = items.map((item, index, all) => p(doc,
    `margin:0;padding:11px 2px;border-bottom:1px solid rgba(24,24,50,0.1);${index === all.length - 1 ? 'border-bottom:0;' : ''}display:flex;align-items:baseline;gap:12px;`,
    sp(doc, `font-family:${SERIF};font-size:${px(13, scale)};font-weight:800;color:${RED};flex-shrink:0;`,
      doc.createTextNode(item.number)),
    sp(doc, `font-size:${px(13, scale)};font-weight:600;color:${INK};flex:1;`, doc.createTextNode(item.title)),
    item.tag ? sp(doc, `font-size:${px(10, scale)};color:#9A94B8;flex-shrink:0;`, doc.createTextNode(item.tag)) : null
  ));
  return sec(doc, 'margin:0 8px 32px;padding:16px 18px 8px;background:#FFFFFF;border:1px solid rgba(24,24,50,0.12);border-radius:2px;',
    p(doc, `margin:0 0 6px;font-size:${px(10, scale)};font-weight:700;color:${MUTED};letter-spacing:2px;font-family:${SANS};`,
      doc.createTextNode(`目录 · ${items.length} SECTIONS`)),
    rows);
}

function cta({ scale, doc, displaySettings }) {
  return buildCtaCard(doc, scale, {
    card: 'background:#FFFFFF;border:1px solid rgba(24,24,50,0.12);border-radius:2px;padding:28px 20px;text-align:center;margin:0 8px 24px;',
    box: `background:${QUOTE_BG};border-radius:2px;`,
    accentBox: 'background:rgba(174,19,0,0.06);border-radius:2px;',
    iconColor: MUTED,
    accentColor: RED,
    leadColor: INK,
    interaction: displaySettings,
    thirdLabel: '转发',
    footer: p(doc, 'font-size:10px;color:#9A94B8;letter-spacing:2px;margin:0;font-family:SANS;', doc.createTextNode('THANKS FOR READING'))
  });
}

export const quailySerifTheme = {
  name: 'Quaily 极简刊',
  preserveQuoteColors: true,
  styles: {
    container: `max-width:677px;box-sizing:border-box;margin:0 auto;padding:16px 0 32px;background-color:#FFFFFF !important;color:${INK} !important;font-family:${SANS};line-height:1.75;overflow-wrap:anywhere;`,
    h1: `margin:0 0 28px;padding:0 8px;font-family:${SERIF};font-size:25px;font-weight:800;line-height:1.35;color:${INK} !important;`,
    h2: `margin:44px 0 24px;padding:0 8px;font-family:${SERIF};font-size:19px;font-weight:800;line-height:1.45;color:${INK} !important;`,
    h3: `margin:30px 0 14px;padding:0 8px 0 10px;border-left:3px solid ${RED};font-family:${SERIF};font-size:16px;font-weight:700;line-height:1.5;color:${INK} !important;`,
    h4: `margin:24px 0 12px;padding:0 8px 0 10px;border-left:3px solid ${RED};font-size:15px;font-weight:700;line-height:1.5;color:${INK} !important;`,
    h5: `margin:20px 0 10px;padding:0 8px;font-size:14px;font-weight:700;color:${INK} !important;`,
    h6: `margin:16px 0 10px;padding:0 8px;font-size:12px;font-weight:700;color:${MUTED} !important;letter-spacing:1px;`,
    p: `margin:0 0 16px;padding:0 8px;font-size:15px;line-height:1.85;text-align:justify;color:#3F3F51 !important;`,
    strong: `font-weight:700;color:${INK} !important;`,
    em: `font-style:italic;color:${MUTED} !important;`,
    a: `color:${RED} !important;font-weight:600;text-decoration:underline;overflow-wrap:break-word;`,
    u: `text-decoration:none;border-bottom:2px solid #E66372;font-weight:600;color:${INK};`,
    mark: `background-color:rgba(174,19,0,0.1);color:${INK};font-weight:600;padding:0 4px;`,
    s: 'color:#9A94B8;text-decoration:line-through;',
    ul: 'margin:0 0 16px;padding:0 8px;',
    ol: 'margin:0 0 16px;padding:0 8px;',
    li: `font-size:14px;line-height:1.85;color:#3F3F51 !important;`,
    'li p': 'margin:6px 0;',
    blockquote: `margin:0 8px 24px;padding:14px 18px;background:${QUOTE_BG};border-radius:2px;`,
    'blockquote p': 'margin:0 0 6px;font-size:13px;color:#3F3F51 !important;',
    code: `font-family:${MONO};font-size:13px;padding:2px 6px;border-radius:2px;background-color:#F0F0F0;color:#16161D;font-weight:600;`,
    pre: `margin:20px 0;padding:16px 18px;background-color:#20202A;color:#FAFAFA;border:0;border-radius:5px;overflow-x:auto;line-height:1.7;`,
    hr: 'margin:20px 8px;height:4px;border-top:1px solid rgba(24,24,50,0.18);border-bottom:1px solid rgba(24,24,50,0.18);',
    img: 'display:block;max-width:100%;height:auto;margin:20px 8px;border-radius:2px;',
    table: 'width:100%;border-collapse:collapse;font-size:13px;',
    th: `padding:9px 12px;text-align:left;background-color:${QUOTE_BG};color:${INK};border-bottom:1px solid ${HAIR};font-weight:700;`,
    td: `padding:9px 12px;border-bottom:1px solid rgba(24,24,50,0.1);color:#3F3F51;line-height:1.7;`,
    tr: 'border:0;'
  },
  transform(doc, ctx) {
    applyComponentFlow(doc, ctx, {
      cover,
      toc,
      tocMinChapters: 2,
      chapter,
      h3sub,
      introQuote,
      quote: blockQuote,
      unorderedList,
      orderedList,
      divider,
      cta
    });
  }
};
