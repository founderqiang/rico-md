/**
 * 专注写作 — Moonvy-flavored restyle of the 摸鱼票据风 components: the
 * ticket-stub metaphor (masthead bar, tear line, stub column, feature-card
 * lists) keeps its structure, while the palette switches to moonvy.com's
 * violet (#5A42E4), dark-indigo masthead (#252232), white soft-shadow cards
 * with generous radii, blue-tinted code surfaces (#E3EDFF / #F2F6FD) and
 * blue hairlines (#DEE5F3). Base template: gzh/moyu-ticket.js.
 * Reference: https://moonvy.com/blog/post/2026/Moonvy-Update/
 */
import { applyComponentFlow } from './engine.js';
import {
  sec, p, sp, leaf, px, splitListItem, moveChildren, buildCtaCard, SANS, MONO
} from './shared.js';

const VIOLET = '#5A42E4';
const BLUE = '#9193ed';
const INDIGO = '#252232';
const PAPER = '#FEFEFE';
const LAV = '#E4E1F0';
const STUB_BG = '#F5F3FB';
const HAIR = '#DEE5F3';
const MUTED = '#7D7E87';
const SOFT_SHADOW = '0 12px 34px rgba(170,172,179,0.15)';

function ticketIssue(doc, issue, scale) {
  const normalized = issue.trim();
  const match = normalized.match(/^(?:NO\.?\s*|第\s*)?(\d+)\s*期?$/i);
  const prefix = match ? 'NO.' : '';
  const number = match ? match[1].padStart(3, '0') : normalized;

  return sec(doc, 'width:100%;min-width:0;text-align:center;font-family:Arial,\'PingFang SC\',sans-serif;line-height:1.5;',
    prefix ? sec(doc, `margin:0 0 5px;font-size:${px(8, scale)};font-weight:700;letter-spacing:1px;color:${MUTED};`, doc.createTextNode(prefix)) : null,
    sec(doc, `font-size:${px(match ? 18 : 11, scale)};font-weight:500;letter-spacing:0.25px;color:${VIOLET};overflow-wrap:anywhere;`, doc.createTextNode(number))
  );
}

function cover(h1, { scale, tag, label, subtitle, summary, footer, footerRight, author, authorBio, stars, issue, aside, grade, tags }) {
  const doc = h1.ownerDocument;
  const masthead = label || tag;
  const footerEnd = footerRight;
  const tagList = tags.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
  const starCount = /^[1-5]$/.test(stars) ? Number(stars) : 0;
  const hasDetails = author || authorBio || summary || tagList.length;
  const hasStub = issue || aside || grade;
  h1.setAttribute('style', `font-size:${px(24, scale)};font-weight:800;color:#252525;letter-spacing:0.5px;margin:0 0 4px;line-height:1.3;font-family:${SANS};`);

  const main = sec(doc, 'display:flex;',
    sec(doc, `flex:1;min-width:0;padding:24px 20px;${hasStub ? `border-right:1px dashed ${LAV};` : ''}`,
      h1,
      subtitle ? sec(doc, `font-size:${px(14, scale)};color:${MUTED};letter-spacing:1px;line-height:1.75;`, doc.createTextNode(subtitle)) : null,
      hasDetails ? sec(doc, `height:0;line-height:0;font-size:0;border-top:1px dashed ${LAV};margin:20px 0;`) : null,
      author || authorBio ? sec(doc, summary || tagList.length ? 'margin-bottom:16px;' : '',
        author ? sec(doc, `font-size:${px(15, scale)};line-height:1.6;color:#252525;font-weight:700;`, doc.createTextNode(author)) : null,
        authorBio ? sec(doc, `font-size:${px(12, scale)};line-height:1.75;color:${MUTED};${author ? 'margin-top:3px;' : ''}`, doc.createTextNode(authorBio)) : null
      ) : null,
      summary ? sec(doc, `font-size:${px(13, scale)};color:#5A5A5A;line-height:1.8;padding:12px;background:${STUB_BG};border:1px solid ${LAV};border-radius:8px;`, doc.createTextNode(summary)) : null,
      tagList.length ? sec(doc, 'display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;', tagList.map((item) => sp(doc, `font-size:${px(10, scale)};color:${VIOLET};border:1px solid ${VIOLET};border-radius:999px;padding:4px 10px;`, doc.createTextNode(`#${item.replace(/^#/, '')}`)))) : null
    ),
    hasStub ? sec(doc, `box-sizing:border-box;flex:0 0 ${px(56, scale)};width:${px(56, scale)};min-width:0;padding:14px 4px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:20px;background:${STUB_BG};`,
      issue ? ticketIssue(doc, issue, scale) : null,
      aside ? sec(doc, 'writing-mode:vertical-rl;font-size:9px;color:#9A94B8;letter-spacing:2px;', doc.createTextNode(aside)) : null,
      grade ? sec(doc, 'text-align:center;',
        sec(doc, `font-size:${px(7, scale)};letter-spacing:1px;color:${MUTED};`, doc.createTextNode('GRADE')),
        sec(doc, `font-size:${px(14, scale)};color:${VIOLET};overflow-wrap:anywhere;`, doc.createTextNode(grade))) : null
    ) : null
  );

  return sec(doc, `background:${PAPER};border:1px solid ${LAV};box-shadow:${SOFT_SHADOW};border-radius:12px;overflow:hidden;margin:0 8px 32px;`,
    masthead || starCount ? sec(doc, `background:${INDIGO};padding:12px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px;`,
      masthead ? sec(doc, `min-width:0;overflow-wrap:anywhere;color:#D9D6E8;font-size:${px(11, scale)};letter-spacing:4px;font-weight:600;`, doc.createTextNode(masthead)) : null,
      starCount ? sec(doc, `flex-shrink:0;margin-left:auto;color:#D9D6E8;font-size:${px(13, scale)};line-height:1;letter-spacing:1px;`, doc.createTextNode('★'.repeat(starCount))) : null
    ) : null,
    main,
    sec(doc, 'height:18px;margin:0 8px;display:flex;align-items:center;',
      sec(doc, `flex:1;height:0;line-height:0;font-size:0;border-top:1px dashed ${LAV};`),
      sp(doc, `display:block;padding:0 8px;font-size:12px;line-height:18px;color:#B9B4CC;`, doc.createTextNode('✂')),
      sec(doc, `flex:1;height:0;line-height:0;font-size:0;border-top:1px dashed ${LAV};`)
    ),
    footer || footerEnd ? sec(doc, 'padding:10px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px;',
      footer ? sec(doc, `font-size:${px(10, scale)};color:${MUTED};letter-spacing:1px;`, doc.createTextNode(footer)) : null,
      footerEnd ? sec(doc, `font-size:${px(10, scale)};color:${MUTED};letter-spacing:1px;margin-left:auto;text-align:right;`, doc.createTextNode(footerEnd)) : null
    ) : null
  );
}

function chapter(h2, { index, number, tag, scale }) {
  const doc = h2.ownerDocument;
  h2.setAttribute('style', `font-size:${px(18, scale)};font-weight:800;color:#252525;letter-spacing:1px;margin:0;line-height:1.4;font-family:${SANS};`);

  return sec(doc, `margin:${index === 0 ? '32px' : '40px'} 0 32px;padding:0 12px;`,
    sec(doc, `display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${HAIR};`,
      sec(doc, `background:${BLUE};color:#fff;font-size:${px(12, scale)};font-weight:800;padding:6px 12px;border-radius:6px;letter-spacing:2px;`, doc.createTextNode(number)),
      h2,
      tag ? sec(doc, `font-size:${px(12, scale)};color:${MUTED};`, doc.createTextNode(`/ ${tag}`)) : null
    )
  );
}

function h3sub(h3, { scale }) {
  const doc = h3.ownerDocument;
  h3.setAttribute('style', `font-size:${px(15, scale)};font-weight:700;color:#252525;margin:0;line-height:1.5;font-family:${SANS};`);
  return sec(doc, 'margin-bottom:16px;padding:0 12px;',
    sec(doc, 'display:flex;align-items:center;gap:8px;margin-bottom:16px;',
      sec(doc, `width:4px;height:16px;background:${VIOLET};border-radius:2px;`, leaf(doc)),
      h3
    )
  );
}

function introQuote(quote, { scale }) {
  const doc = quote.ownerDocument;
  const card = sec(doc, `background:${PAPER};border:1px solid ${LAV};box-shadow:${SOFT_SHADOW};border-radius:12px;padding:20px;margin:0 12px 32px;`);
  moveChildren(quote, card);
  Array.from(card.children).filter((child) => child.tagName === 'P').forEach((para, index, all) => {
    para.setAttribute('style', `font-size:${index === all.length - 1 ? px(14, scale) : px(15, scale)};color:#252525;font-weight:700;line-height:1.8;margin:${index === all.length - 1 ? '0' : '0 0 12px'};text-align:${index === all.length - 1 ? 'justify' : 'center'};`);
  });
  return card;
}

function blockQuote(quote, { scale }) {
  const doc = quote.ownerDocument;
  const card = sec(doc, `background:${STUB_BG};border-left:4px solid ${VIOLET};border-radius:0 8px 8px 0;padding:14px 16px;margin:0 12px 32px;`);
  moveChildren(quote, card);
  Array.from(card.children).filter((child) => child.tagName === 'P').forEach((para, index, all) => {
    para.setAttribute('style', `font-size:${px(14, scale)};color:#5A5A5A;font-weight:600;line-height:1.7;margin:${index === all.length - 1 ? '0' : '0 0 6px'};`);
  });
  return card;
}

function featureCard(doc, scale, markerColumn, content) {
  return sec(doc, `background:${PAPER};border:1px solid #EAEBF3;border-radius:8px;overflow:hidden;margin:0 12px 12px;box-shadow:0 4px 14px rgba(170,172,179,0.1);`,
    sec(doc, 'display:flex;align-items:stretch;',
      markerColumn,
      sec(doc, `flex:1;padding:12px 16px;font-size:${px(13, scale)};color:#5A5A5A;line-height:1.7;border-left:1px dashed ${LAV};`, content)
    )
  );
}

function appendListContent(doc, item, content) {
  const { label, description, descriptionNodes } = splitListItem(item);
  if (label && !description && !descriptionNodes) {
    moveChildren(item, content);
  } else if (label && descriptionNodes) {
    content.appendChild(sp(doc, `font-weight:600;color:#252525;`, doc.createTextNode(label)));
    content.appendChild(doc.createTextNode('：'));
    descriptionNodes.forEach((node) => content.appendChild(node));
  } else if (label && description) {
    content.appendChild(sp(doc, `font-weight:600;color:#252525;`, doc.createTextNode(label)));
    content.appendChild(doc.createTextNode(`：${description}`));
  } else {
    moveChildren(item, content);
  }
}

function unorderedList(ul, { scale, doc }) {
  return Array.from(ul.children).filter((child) => child.tagName === 'LI').map((item) => {
    const content = sec(doc, '');
    appendListContent(doc, item, content);
    const marker = sec(doc, 'width:28px;flex-shrink:0;background:linear-gradient(180deg,#EAE7FF,#F8F7FF);display:flex;align-items:center;justify-content:center;',
      sp(doc, `width:7px;height:7px;background:${VIOLET};border-radius:50%;`, leaf(doc)));
    return featureCard(doc, scale, marker, content);
  });
}

function orderedList(ol, { scale, doc }) {
  return Array.from(ol.children).filter((child) => child.tagName === 'LI').map((item, index) => {
    const content = sec(doc, '');
    appendListContent(doc, item, content);
    const marker = sec(doc, `width:28px;flex-shrink:0;background:linear-gradient(180deg,#EAE7FF,#F8F7FF);display:flex;align-items:center;justify-content:center;color:${VIOLET};font-size:${px(12, scale)};font-weight:800;`,
      doc.createTextNode(String(index + 1)));
    return featureCard(doc, scale, marker, content);
  });
}

function divider(rule, { isLast, scale }) {
  const doc = rule.ownerDocument;
  if (!isLast) {
    return sec(doc, `margin:32px 12px;border-top:1px dashed ${LAV};`, leaf(doc));
  }
  return p(doc, `text-align:center;color:#D9D6E8;font-size:${px(14, scale)};margin:24px 0 0;`, doc.createTextNode('/'));
}

function cta({ scale, doc, displaySettings }) {
  const card = buildCtaCard(doc, scale, {
    card: `background:${PAPER};border:1px solid ${LAV};box-shadow:${SOFT_SHADOW};border-radius:12px;padding:24px 20px;text-align:center;margin:0 12px 32px;`,
    box: `background:#fff;border:1px solid ${LAV};border-radius:8px;`,
    accentBox: `background:${STUB_BG};border:2px solid ${VIOLET};border-radius:8px;`,
    iconColor: MUTED,
    accentColor: VIOLET,
    leadColor: '#252525',
    interaction: displaySettings,
    thirdLabel: '星标',
    thirdIcon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>'
  });
  // Replace the default footer paragraph with the dashed tear footer. The
  // icons row is a <section>, so the tag guard keeps it intact even though
  // this skin ships no default footer of its own.
  const footer = card.lastElementChild;
  if (footer && footer.tagName === 'P') card.removeChild(footer);
  card.appendChild(sec(doc, `border-top:1px dashed ${LAV};padding-top:12px;`,
    p(doc, `font-size:${px(10, scale)};color:${MUTED};letter-spacing:2px;margin:0;`, doc.createTextNode('THANKS FOR READING ✂'))));
  return card;
}

export const focusWritingTheme = {
  name: '专注写作',
  preserveQuoteColors: true,
  styles: {
    container: `max-width:677px;box-sizing:border-box;margin:0 auto;padding:16px 0 32px;background-color:#FEFEFE !important;color:#252525 !important;font-family:${SANS};line-height:1.75;letter-spacing:0.5px;overflow-wrap:anywhere;`,
    h1: `margin:0 0 28px;padding:0 12px;font-family:${SANS};font-size:24px;font-weight:800;line-height:1.3;color:#252525 !important;`,
    h2: `margin:0 0 32px;padding:0 12px;font-family:${SANS};font-size:18px;font-weight:800;line-height:1.4;color:#252525 !important;`,
    h3: `margin:16px 0 16px;padding:0 12px;font-family:${SANS};font-size:15px;font-weight:700;line-height:1.5;color:#252525 !important;`,
    h4: `margin:24px 0 12px;padding:0 12px;font-size:15px;font-weight:700;line-height:1.5;color:#252525 !important;`,
    h5: `margin:20px 0 10px;padding:0 12px;font-size:14px;font-weight:700;color:#252525 !important;`,
    h6: `margin:18px 0 10px;padding:0 12px;font-size:13px;font-weight:700;color:${MUTED} !important;`,
    p: `margin:0 0 16px;padding:0 12px;font-size:15px;line-height:1.9;text-align:justify;color:#252525 !important;`,
    strong: `font-weight:700;color:${VIOLET} !important;`,
    em: `font-style:italic;color:${MUTED} !important;`,
    a: `color:${VIOLET} !important;font-weight:700;text-decoration:underline;overflow-wrap:break-word;`,
    u: `color:inherit;background-color:#FFF594;border-radius:max(.25rem,2px);padding:.06rem .36rem;text-decoration:none;`,
    mark: `background:linear-gradient(120deg,rgba(116,106,240,0.28) 0%,rgba(116,106,240,0) 100%);color:#252525;padding:0 4px;font-weight:600;`,
    s: `color:#B9B4CC;text-decoration:line-through;`,
    ul: 'margin:0 0 16px;padding:0 12px;',
    ol: 'margin:0 0 16px;padding:0 12px;',
    li: `margin:8px 0;font-size:15px;line-height:1.9;color:#252525 !important;`,
    'li p': 'margin:6px 0;',
    blockquote: `margin:0 12px 32px;padding:14px 16px;background:${STUB_BG};border-left:4px solid ${VIOLET};border-radius:0 8px 8px 0;`,
    'blockquote p': `margin:0 0 6px;font-size:14px;font-weight:600;color:#5A5A5A !important;`,
    code: `font-family:${MONO};font-size:13px;padding:2px 6px;border-radius:4px;background-color:#E3EDFF;color:#415BA7;font-weight:600;`,
    pre: `margin:20px 0;padding:16px;background-color:#F2F6FD;color:#414774;border:1px solid ${HAIR};border-left:3px solid ${VIOLET};border-radius:8px;overflow-x:auto;line-height:1.7;`,
    hr: `margin:32px 12px;border:0;border-top:1px dashed ${LAV};`,
    img: `display:block;max-width:100%;height:auto;margin:20px 12px;background:${PAPER};border:1px solid #EAEBF3;border-radius:8px;`,
    table: 'width:100%;border-collapse:collapse;font-size:13px;',
    th: `padding:10px 12px;text-align:left;background-color:${VIOLET};color:#FFFFFF;border-bottom:1px solid ${LAV};font-weight:800;`,
    td: `padding:10px 12px;border-bottom:1px solid #EAEBF3;color:#252525;line-height:1.7;`,
    tr: 'border:0;'
  },
  transform(doc, ctx) {
    applyComponentFlow(doc, ctx, {
      cover,
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
