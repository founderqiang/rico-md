/**
 * 石墨极简风 — grey-scale minimal components (watermark chapter numbers,
 * QUOTE card, hairline frames, graphite underline marks).
 * Upstream: theme-graphite-minimal.md.
 */
import { applyComponentFlow } from './engine.js';
import {
  sec, p, sp, leaf, px, splitListItem, moveChildren, buildCtaCard, SANS, MONO
} from './shared.js';

const GRAPHITE = '#52525B';
const CHARCOAL = '#27272A';
const HAIRLINE = '#E4E4E7';

function pill(doc, scale, label) {
  return sp(doc,
    `display:inline-block;font-size:${px(14, scale)};font-weight:700;color:${CHARCOAL};background:#F4F4F5;padding:3px 10px;border-radius:999px;vertical-align:middle;`,
    sp(doc, `display:inline-block;width:6px;height:6px;background:${GRAPHITE};border-radius:50%;margin-right:5px;vertical-align:middle;`, leaf(doc)),
    doc.createTextNode(label));
}

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

  const card = sec(doc, 'margin:10px 10px 40px;padding:32px 24px 24px;border-top:1px solid #E4E4E7;border-bottom:1px solid #E4E4E7;background:#FFFFFF;',
    p(doc, `font-size:${px(11, scale)};color:#A1A1AA;letter-spacing:2px;margin:0 0 18px;font-weight:400;`, doc.createTextNode('QUOTE')));

  (paras.length > 0 ? paras : [quote]).forEach((para) => {
    const line = p(doc, `font-size:${px(18, scale)};font-weight:700;color:${CHARCOAL};margin:0 0 8px;line-height:1.7;letter-spacing:0.5px;`);
    moveChildren(para, line);
    card.appendChild(line);
  });

  if (signature) {
    card.appendChild(p(doc, `text-align:right;font-size:${px(12, scale)};color:#A1A1AA;margin:16px 0 0;letter-spacing:1px;`, doc.createTextNode(signature)));
  }
  return card;
}

function toc(items, { scale, doc }) {
  const cards = items.slice(0, 3).map((item, index) => {
    const style = index === 2
      ? `flex:1;background:#FAFAFA;border-top:1px solid ${HAIRLINE};padding:18px 12px 16px;`
      : `flex:1;background:#FAFAFA;border-top:1px solid ${HAIRLINE};padding:18px 12px 16px;margin-right:8px;`;
    return sec(doc, style,
      p(doc, `font-size:${px(11, scale)};color:#A1A1AA;font-weight:500;margin:0 0 8px;letter-spacing:1px;`, doc.createTextNode(item.number)),
      p(doc, `font-size:${px(13, scale)};font-weight:700;color:${CHARCOAL};margin:0;line-height:1.5;`, doc.createTextNode(item.title)));
  });
  return sec(doc, 'padding:0 10px 40px;',
    p(doc, `font-size:${px(11, scale)};color:#A1A1AA;margin:0 0 16px;letter-spacing:2px;`, doc.createTextNode('本文看点')),
    sec(doc, 'display:flex;justify-content:space-between;', cards));
}

function chapter(h2, { index, isLast, number, tag, scale }) {
  const doc = h2.ownerDocument;
  h2.setAttribute('style', `font-size:${px(20, scale)};font-weight:800;color:${CHARCOAL};margin:0;letter-spacing:0.5px;line-height:1.4;font-family:${SANS};`);

  return sec(doc, `margin:${index === 0 ? '32px' : '56px'} 0 32px;padding:0 10px;`,
    sec(doc, 'position:relative;padding-bottom:20px;border-bottom:1px solid #E4E4E7;',
      p(doc, `font-size:${px(48, scale)};font-weight:900;color:${HAIRLINE};margin:0;line-height:1;letter-spacing:-2px;`,
        doc.createTextNode(isLast ? '∞' : number)),
      // With a tag the label sits in the -8px overlap zone under the number;
      // without one the title needs real breathing room below it.
      sec(doc, `margin-top:${tag ? '-8px' : '8px'};`,
        tag ? p(doc, `font-size:${px(10, scale)};color:#A1A1AA;font-weight:500;letter-spacing:3px;margin:0 0 6px;text-transform:uppercase;`, doc.createTextNode(tag)) : null,
        h2
      )
    )
  );
}

function h3sub(h3, { scale }) {
  h3.setAttribute('style', `margin:28px 0 14px;padding-left:12px;border-left:3px solid ${GRAPHITE};font-size:${px(15, scale)};font-weight:800;color:${CHARCOAL};line-height:1.4;font-family:${SANS};`);
  return h3;
}

function blockQuote(quote, { scale }) {
  const doc = quote.ownerDocument;
  const card = sec(doc, `border-left:3px solid ${GRAPHITE};padding:16px 0 16px 24px;margin:24px 10px 28px;`);
  moveChildren(quote, card);
  Array.from(card.children).filter((child) => child.tagName === 'P').forEach((para, index, all) => {
    para.setAttribute('style', `font-size:${px(16, scale)};font-weight:700;color:${CHARCOAL};margin:${index === all.length - 1 ? '0' : '0 0 8px'};line-height:1.7;letter-spacing:0.5px;`);
  });
  return card;
}

function unorderedList(ul, { scale }) {
  const doc = ul.ownerDocument;
  return Array.from(ul.children).filter((child) => child.tagName === 'LI').map((item) => {
    const { label, description, descriptionNodes } = splitListItem(item);
    const block = sec(doc, 'margin:0 10px 14px;');
    const desc = p(doc, `font-size:${px(14, scale)};color:#71717A;margin:0;line-height:1.7;text-align:justify;`);
    if (label) {
      desc.appendChild(pill(doc, scale, label));
      desc.appendChild(doc.createTextNode(' '));
    }
    if (descriptionNodes) descriptionNodes.forEach((node) => desc.appendChild(node));
    else if (description) desc.appendChild(doc.createTextNode(description));
    else if (!label) moveChildren(item, desc);
    else return block;
    block.appendChild(desc);
    return block;
  });
}

function orderedList(ol, { scale }) {
  const doc = ol.ownerDocument;
  return Array.from(ol.children).filter((child) => child.tagName === 'LI').map((item, index) => {
    const row = sec(doc, 'display:flex;align-items:flex-start;gap:10px;margin:0 10px 12px;');
    row.appendChild(sp(doc,
      `display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:${CHARCOAL};color:#fff;font-size:${px(12, scale)};font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;`,
      doc.createTextNode(String(index + 1))));
    const content = p(doc, `font-size:${px(15, scale)};color:${GRAPHITE};margin:0;line-height:1.8;flex:1;`);
    moveChildren(item, content);
    row.appendChild(content);
    return row;
  });
}

function divider(rule, { isLast, scale }) {
  const doc = rule.ownerDocument;
  if (!isLast) {
    return sec(doc, 'padding:0 10px;',
      sec(doc, `height:1px;background:${HAIRLINE};margin:0;`, leaf(doc)));
  }
  return sec(doc, 'padding:0 10px;',
    sec(doc, 'text-align:center;margin:0 0 36px;',
      sec(doc, 'display:flex;align-items:center;justify-content:center;',
        sp(doc, `height:1px;width:48px;background:${HAIRLINE};margin-right:16px;`, leaf(doc)),
        sp(doc, `font-size:${px(10, scale)};color:#A1A1AA;letter-spacing:4px;font-weight:500;`, doc.createTextNode('END')),
        sp(doc, `height:1px;width:48px;background:${HAIRLINE};margin-left:16px;`, leaf(doc))
      )
    )
  );
}

function cta({ scale, doc, displaySettings }) {
  return buildCtaCard(doc, scale, {
    card: `border:1px solid ${HAIRLINE};padding:32px 20px;text-align:center;margin:0 10px 24px;background:#FFFFFF;`,
    box: `background:#FFFFFF;border:1px solid ${HAIRLINE};border-radius:8px;`,
    accentBox: `background:#F4F4F5;border:1px solid ${GRAPHITE};border-radius:8px;`,
    iconColor: '#71717A',
    accentColor: GRAPHITE,
    leadColor: CHARCOAL,
    interaction: displaySettings,
    leadWeight: 700,
    thirdLabel: '转发',
    footer: p(doc, 'font-size:10px;color:#A1A1AA;letter-spacing:2px;margin:0;', doc.createTextNode('THANKS FOR READING'))
  });
}

export const graphiteMinimalTheme = {
  name: '石墨极简风',
  preserveQuoteColors: true,
  styles: {
    container: `max-width:677px;box-sizing:border-box;margin:0 auto;padding:8px 0 32px;background-color:#FFFFFF !important;color:${GRAPHITE} !important;font-family:${SANS};line-height:1.8;letter-spacing:0.3px;overflow-wrap:anywhere;`,
    h1: `margin:10px 10px 32px;padding:0;font-family:${SANS};font-size:22px;font-weight:800;line-height:1.4;color:${CHARCOAL} !important;letter-spacing:0.5px;`,
    h2: `margin:56px 0 32px;padding:0 10px;font-family:${SANS};font-size:20px;font-weight:800;line-height:1.4;color:${CHARCOAL} !important;`,
    h3: `margin:28px 0 14px;padding:0 10px 0 12px;border-left:3px solid ${GRAPHITE};font-family:${SANS};font-size:15px;font-weight:800;line-height:1.4;color:${CHARCOAL} !important;`,
    h4: `margin:24px 0 12px;padding:0 10px;font-size:15px;font-weight:800;line-height:1.5;color:${CHARCOAL} !important;`,
    h5: `margin:20px 0 10px;padding:0 10px;font-size:14px;font-weight:700;color:${CHARCOAL} !important;`,
    h6: `margin:18px 0 10px;padding:0 10px;font-size:13px;font-weight:600;color:#A1A1AA !important;`,
    p: `margin:0 0 22px;padding:0 10px;font-size:15px;line-height:1.8;text-align:justify;color:${GRAPHITE} !important;letter-spacing:0.3px;`,
    strong: `font-weight:700;color:${CHARCOAL} !important;`,
    em: 'font-style:italic;color:#71717A !important;',
    a: `color:${GRAPHITE} !important;font-weight:600;text-decoration:underline;overflow-wrap:break-word;`,
    u: `text-decoration:none;border-bottom:2px solid ${GRAPHITE};font-weight:600;color:${CHARCOAL};`,
    mark: `background-color:#F4F4F5;color:${CHARCOAL};padding:2px 7px;border-radius:3px;font-weight:700;`,
    s: 'color:#A1A1AA;text-decoration:line-through;',
    ul: 'margin:0 0 16px;padding:0 10px;',
    ol: 'margin:0 0 16px;padding:0 10px;',
    li: `margin:8px 0;font-size:15px;line-height:1.8;color:${GRAPHITE} !important;`,
    'li p': 'margin:6px 0;',
    blockquote: `margin:24px 10px 28px;padding:16px 0 16px 24px;border-left:3px solid ${GRAPHITE};`,
    'blockquote p': `margin:0 0 8px;font-size:16px;font-weight:700;color:${CHARCOAL} !important;`,
    code: `font-family:${MONO};font-size:14px;padding:2px 6px;border-radius:4px;background-color:#F4F4F5;color:${CHARCOAL};`,
    pre: `margin:20px 0;padding:16px;background-color:#FAFAFA;color:${CHARCOAL};border:1px solid ${HAIRLINE};border-radius:6px;overflow-x:auto;line-height:1.7;`,
    hr: `margin:24px 0;border:0;border-top:1px solid ${HAIRLINE};`,
    img: `display:block;max-width:100%;height:auto;margin:24px auto;border:1px solid ${HAIRLINE};border-radius:0;`,
    table: 'width:100%;border-collapse:collapse;font-size:14px;',
    th: `padding:10px 12px;text-align:left;background-color:${CHARCOAL};color:#FFFFFF;border-bottom:1px solid ${HAIRLINE};font-weight:700;`,
    td: `padding:10px 12px;border-bottom:1px solid ${HAIRLINE};color:${GRAPHITE};line-height:1.7;`,
    tr: 'border:0;',
    'tbody tr:nth-child(even)': 'background-color:#FAFAFA;'
  },
  transform(doc, ctx) {
    applyComponentFlow(doc, ctx, {
      toc,
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
