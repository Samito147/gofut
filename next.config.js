// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return [
      {
        source: '/',           // quando bater em "/"
        destination: '/tabela.html', // devolve este arquivo
      },
    ]
  },
}
