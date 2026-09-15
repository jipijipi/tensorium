import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://tensoratlas.org',
  output: 'static',
  integrations: [mdx()],
  devToolbar: { enabled: false },
});
