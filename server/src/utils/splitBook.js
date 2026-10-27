// Turns a whole book (one big text file) into a list of chapters.
//
// How it works:
// 1. Cut off the Project Gutenberg licence text at the start and end.
// 2. Find every line that looks like a chapter heading ("CHAPTER I.", "Chapter 1", "Letter 1"...).
// 3. Everything between two headings becomes one chapter.
// 4. If no headings are found, split the book into equal "Parts" instead.

// Default heading rule: a line starting with "Chapter" or "Letter" followed by a number
// (1, 2, 3 or I, II, III). Upper or lower case both work.
const DEFAULT_PATTERN = '^(?:chapter|letter)\\s+(?:\\d+|[ivxlcdm]+)\\b.*$';

function stripGutenbergWrapper(text) {
  const start = text.search(/^\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG.*$/im);
  if (start !== -1) text = text.slice(text.indexOf('\n', start) + 1);
  const end = text.search(/^\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG.*$/im);
  if (end !== -1) text = text.slice(0, end);
  // Older files also end with a line like "End of the Project Gutenberg EBook of ..."
  const endLine = text.search(/^End of (?:the )?Project Gutenberg.*$/im);
  if (endLine !== -1) text = text.slice(0, endLine);
  return text;
}

// Gutenberg files break lines every ~70 characters. Re-join the lines of each paragraph
// so text flows nicely on any screen. Indented blocks (poems, letters) keep their line breaks.
function tidyParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((para) => {
      const lines = para.split('\n').filter((line) => line.trim());
      if (!lines.length) return '';
      const isIndentedBlock = lines.length > 1 && lines.every((line) => /^\s/.test(line));
      return isIndentedBlock
        ? lines.map((line) => line.trim()).join('\n')
        : lines.map((line) => line.trim()).join(' ');
    })
    .filter(Boolean)
    .join('\n\n');
}

function splitIntoParts(text, wordsPerPart) {
  const paragraphs = tidyParagraphs(text).split('\n\n');
  const parts = [];
  let current = [];
  let words = 0;
  for (const para of paragraphs) {
    current.push(para);
    words += para.split(/\s+/).length;
    if (words >= wordsPerPart) {
      parts.push(current.join('\n\n'));
      current = [];
      words = 0;
    }
  }
  if (current.length) parts.push(current.join('\n\n'));
  return parts.map((content, i) => ({ title: `Part ${i + 1}`, content }));
}

/**
 * @param {string} rawText  the whole book
 * @param {object} options
 *   chapterPattern     - custom heading rule (text form of a regular expression)
 *   ignoreCase         - whether the heading rule ignores upper/lower case (default true)
 *   minChapterLength   - chapters shorter than this many characters are skipped (e.g. a table of contents)
 *   wordsPerPart       - size of each "Part" when no headings are found
 * @returns {{ chapters: {title, content}[], skipped: string[], usedFallback: boolean }}
 */
function splitBook(rawText, options = {}) {
  const {
    chapterPattern = DEFAULT_PATTERN,
    ignoreCase = true,
    minChapterLength = 200,
    wordsPerPart = 3000,
  } = options;

  const text = stripGutenbergWrapper(rawText.replace(/\r\n?/g, '\n'));
  const headingRegex = new RegExp(chapterPattern, ignoreCase ? 'gim' : 'gm');
  const headings = [...text.matchAll(headingRegex)];

  if (!headings.length) {
    return { chapters: splitIntoParts(text, wordsPerPart), skipped: [], usedFallback: true };
  }

  const chapters = [];
  const skipped = [];
  headings.forEach((match, i) => {
    const bodyStart = match.index + match[0].length;
    const bodyEnd = i + 1 < headings.length ? headings[i + 1].index : text.length;
    const title = match[0].replace(/\s+/g, ' ').trim(); // a heading can span two lines ("I" + "Introduction")
    const content = tidyParagraphs(text.slice(bodyStart, bodyEnd));
    if (content.length < minChapterLength) skipped.push(title);
    else chapters.push({ title, content });
  });

  return { chapters, skipped, usedFallback: false };
}

module.exports = { splitBook, DEFAULT_PATTERN };
