/**
 * Build portable Markdown archives. Local editor images use the `img://` scheme
 * in IndexedDB, so an exported archive rewrites only those image references to
 * ordinary relative files and adds their original binary data to the ZIP.
 */

function safeFilename(name, fallback = 'article') {
  return (name || fallback)
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || fallback;
}

function getImageExtension(record) {
  const sourceName = record?.originalName || record?.name || '';
  const suffix = sourceName.match(/\.([a-z0-9]{1,8})$/i)?.[1]?.toLowerCase();
  if (suffix) return suffix === 'jpeg' ? 'jpg' : suffix;

  const mimeType = record?.blob?.type || record?.mimeType || '';
  return {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/avif': 'avif'
  }[mimeType] || 'bin';
}

function getLocalImageIds(markdown) {
  const ids = new Set();
  const markdownImagePattern = /!\[[^\]]*\]\(\s*img:\/\/([^\s)]+)(?=\s|\))/g;
  const htmlImagePattern = /<img\b[^>]*?\bsrc\s*=\s*["']img:\/\/([^"']+)["'][^>]*>/gi;

  for (const pattern of [markdownImagePattern, htmlImagePattern]) {
    let match;
    while ((match = pattern.exec(markdown))) ids.add(match[1]);
  }

  return [...ids];
}

function replaceLocalImageSources(markdown, imagePaths) {
  return markdown
    .replace(/(!\[[^\]]*\]\(\s*)img:\/\/([^\s)]+)(?=\s|\))/g, (full, prefix, id) => {
      return imagePaths.has(id) ? `${prefix}${imagePaths.get(id)}` : full;
    })
    .replace(/(<img\b[^>]*?\bsrc\s*=\s*["'])img:\/\/([^"']+)(["'][^>]*>)/gi, (full, prefix, id, suffix) => {
      return imagePaths.has(id) ? `${prefix}${imagePaths.get(id)}${suffix}` : full;
    });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function buildImageManifest(documents, imageStore) {
  const ids = [...new Set(documents.flatMap((doc) => getLocalImageIds(doc.content || '')))];
  const images = new Map();
  const missingIds = [];

  for (const id of ids) {
    const record = await imageStore.getImageRecord(id);
    if (!record?.blob) {
      missingIds.push(id);
      continue;
    }

    const filename = `${safeFilename(record.name, 'image')}-${safeFilename(id, 'asset')}.${getImageExtension(record)}`;
    images.set(id, { filename, blob: record.blob });
  }

  return { images, missingIds };
}

async function createArchive({ documents, imageStore, folderName, documentFolder = '' }) {
  if (!window.JSZip) {
    throw new Error('压缩组件尚未加载，请检查网络后刷新页面重试');
  }

  const zip = new window.JSZip();
  const root = zip.folder(folderName);
  const { images, missingIds } = await buildImageManifest(documents, imageStore);
  const imageFolder = root.folder('images');

  images.forEach(({ filename, blob }) => imageFolder.file(filename, blob));

  const docsFolder = documentFolder ? root.folder(documentFolder) : root;
  const imagePathPrefix = documentFolder ? '../images/' : 'images/';
  const usedNames = new Set();
  documents.forEach((doc) => {
    const baseName = safeFilename(doc.title, 'article');
    let name = baseName;
    let suffix = 2;
    while (usedNames.has(name.toLowerCase())) name = `${baseName}-${suffix++}`;
    usedNames.add(name.toLowerCase());

    const imagePaths = new Map();
    getLocalImageIds(doc.content || '').forEach((id) => {
      const image = images.get(id);
      if (image) imagePaths.set(id, `${imagePathPrefix}${image.filename}`);
    });
    docsFolder.file(`${name}.md`, replaceLocalImageSources(doc.content || '', imagePaths));
  });

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  return { blob, missingIds };
}

export async function exportDocumentArchive({ document, imageStore }) {
  const title = safeFilename(document.title, 'article');
  const { blob, missingIds } = await createArchive({
    documents: [document],
    imageStore,
    folderName: title
  });
  triggerDownload(blob, `${title}-含图片.zip`);
  return { missingIds };
}

export async function exportAllDocumentsArchive({ documents, imageStore }) {
  const { blob, missingIds } = await createArchive({
    documents,
    imageStore,
    folderName: 'rico-md-全部文档',
    documentFolder: 'documents'
  });
  triggerDownload(blob, 'rico-md-全部文档-含图片.zip');
  return { missingIds };
}
