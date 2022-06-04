import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import markdown from 'markdown-it';
import markdownLinkAttributes from 'markdown-it-link-attributes';
import matter from 'gray-matter';

// Get all the MD files
const files = readdirSync(dirname(fileURLToPath(import.meta.url))).filter(file => file.endsWith('.md'));

// Create the MD renderer
const md = markdown({ typographer: true });
md.use(markdownLinkAttributes, {
  attrs: {
    target: '_blank',
    rel: 'noreferrer',
  },
});

// Read, parse and render all the files
const data = files.reduce((obj, file) => {
  const raw = readFileSync(new URL(file, import.meta.url), 'utf8');
  const { data, content } = matter(raw);
  const rendered = md.render(content);
  return { ...obj, [file.replace(/\.md$/, '')]: { data, content: rendered } };
}, {});

// Write the data object
writeFileSync(new URL('data.json', import.meta.url), JSON.stringify(data, null, 2));
