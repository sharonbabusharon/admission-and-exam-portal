import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    // This demo uses browser storage and does not need a server.
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html'
    })
  }
};
