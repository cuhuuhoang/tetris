import { defineConfig } from 'vite'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  base: repoName ? `/${repoName}/` : '/',
  server: {
    port: 7402,
    host: '0.0.0.0',
    allowedHosts: ['hoangch-virt.dev.itim.vn']
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8'
    }
  }
})
