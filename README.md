# Dijix PDF

### Isomorphic PDF Processing Plugin for Dijix

Requires [Dijix Image](https://github.com/digixglobal/dijix-image) to included as a plugin.

```javascript
// initialise
digix.registerTypes([
  new DijixPDF({
    watermark: () => // TODO
    thumbnails: { // optional thumbnail configs
      quality: 0.7, // default
      32: {
        quality: 0.2,
        square: true // TODO
      },
      64: { quality: 0.6 },
      256: true,
      512: true,
    },
  }),
]);

// accepts file object (browser) or file path (node)
dijix.create('pdf', { src, name, fileName, ...configOverrides });

/*
name: 'Profit Report 2016',
fileName: 'accounting_report.pdf',
metaData: { ... }, // extracted pdf metadata
size: 123123123,
src: 'ipfs://<ipfs hash>', // original PDF src
mime: 'application/pdf'
pageCount: 4,
pages: [
  'ipfs://<ipfs hash>', // links to imageWithThumbnails
  'ipfs://<ipfs hash>',
  'ipfs://<ipfs hash>',
  'ipfs://<ipfs hash>',
]
*/
```
