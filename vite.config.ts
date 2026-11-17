import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Actions supplies GITHUB_REPOSITORY (owner/repo).
// Repository Pages: /repo/ ; username.github.io root Pages: /.
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = repositoryName
  ? repositoryName.endsWith('.github.io') ? '/' : `/${repositoryName}/`
  : '/';

export default defineConfig({
  plugins: [react()],
  base,
});
