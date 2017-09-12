# Dijix Image

### Isomorphic Image Processing Plugin for Dijix

To use in node, make sure you install the deps before installing:

```
# osx
brew install pkg-config cairo libpng jpeg giflib
# ubuntu
sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
```

```javascript
// initialise
digix.registerTypes([
  new DijixImage({
    quality: 0.5,
    maxWidth: 2000,
    format: 'jpeg', // or 'png' - leave blank to inherit
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

// usage

// accepts base64 or file path
dijix.create('image', { src, name, fileName, ...configOverrides });

/*
name: 'An Adorable Kitten',
fileName: 'kitten.jpg',
mimeType: 'image/jpeg',
src: 'ipfs://<ipfs hash>',
width: 2048,
height: 1024,
size: 12301293, // bytes
thumbnails: {
  64: 'ipfs://<ipfs hash>', // links to raw 64 x 32 jpeg image
  256: 'ipfs://<ipfs hash>',
  512: 'ipfs://<ipfs hash>',
  1024: 'ipfs://<ipfs hash>',
},
*/
```
