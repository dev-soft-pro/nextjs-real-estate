import fetch from 'isomorphic-unfetch'

export function getLinks(url: string) {
  const region = 'us-west-2'
  const bucketName = 'tophap-assets'

  if (!/sitemap\/html\/(.*)\.html/.test(url)) {
    return Promise.resolve({
      url,
      title: '',
      items: []
    })
  }

  return fetch(`https://${bucketName}.s3-${region}.amazonaws.com${url}`)
    .then(res => res.text())
    .then(html => {
      const res: any = { url }

      const title = html.match(/<h1>(.*)<\/h1>/)
      if (title && title[1]) res.title = title[1]

      const items = html.match(/<li>(.*)<\/li>/g)
      if (items) {
        res.items = items.map(e => {
          const m = e.match(/<li><a href="(.*)">(.*)<\/a><\/li>/) as string[]
          return {
            url: m[1].replace(/^(https:\/\/www.tophap.com|^.\/)/, ''),
            title: m[2]
          }
        })
      } else {
        res.items = []
      }

      return res
    })
}
