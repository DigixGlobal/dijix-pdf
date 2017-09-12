/* eslint-disable max-len, global-require */
/* globals window */

import assert from 'assert';

import DijixPDF from '../src';

const mockDijix = {
  ipfs: {
    put: (data) => {
      if (Array.isArray(data)) { return data.map((o, i) => `Fake IFPS Hash ${i}`); }
      return 'Fake IPFS Hash';
    },
  },
  create: async (type, { src }) => {
    if (type !== 'image') { throw new Error('Not creating image'); }
    if (!src) { throw new Error('No source'); }
    return { ipfsHash: 'test ipfs hash' };
  },
};

const isBrowser = typeof window !== 'undefined';

// stub file reader
if (isBrowser) {
  window.FileReader = class FileReader {
    readAsArrayBuffer() {
      this.result = require('./test.pdf');
      this.onload();
    }
  };
}

const testPdfSrc = !isBrowser ? 'test/test.pdf' : {};

const fakePages = [
  'test ipfs hash',
  'test ipfs hash',
  'test ipfs hash',
  'test ipfs hash',
  'test ipfs hash',
];

let dijixPdf = new DijixPDF();

describe('DijixPDF', function () {
  this.timeout(Infinity);
  let pdf;
  before(async function () {
    pdf = await dijixPdf.getPagesData(await dijixPdf.readInput(testPdfSrc));
  });
  describe('readInput', function () {
    it('reads the input', async function () {
      assert.deepEqual((await dijixPdf.readInput(testPdfSrc)).slice(0, 10), [37, 80, 68, 70, 45, 49, 46, 51, 10, 37]);
    });
  });
  describe('getPagesData', function () {
    it('gets page data', async function () {
      const { loadingTask, pdfInfo: { numPages, fingerprint, encrypted } } = pdf;
      assert.equal(numPages, 5);
      assert.equal(fingerprint, 'a9f49b1f1aa70435255166a6e7c75857');
      assert.equal(encrypted, false);
      assert.equal(loadingTask.fileSize, 9281);
    });
  });
  describe('getPagesImageData', function () {
    it('returns the page image data', async function () {
      const pages = await dijixPdf.getPagesImageData(pdf);
      assert.equal(JSON.stringify(pages).length, isBrowser ? 216798 : 79906);
    });
  });
  describe('generatePageThumbnails', function () {
    it('generates images and uploads them to ipfs', async function () {
      assert.deepEqual(await dijixPdf.generatePageThumbnails({ pdf, dijix: mockDijix }), fakePages);
    });
  });
  describe('creationPipeline', function () {
    it('uploads the pdf and creates thumbnails', async function () {
      const { fileSize, metaData, pageCount, src, fileName, name, pages } = await dijixPdf.creationPipeline({ src: testPdfSrc }, mockDijix);
      assert.equal(fileSize, 9281);
      assert.equal(typeof metaData, 'object');
      assert.equal(pageCount, 5);
      assert.equal(src, 'Fake IPFS Hash');
      assert.equal(fileName, isBrowser ? undefined : 'test.pdf');
      assert.equal(name, 'Microsoft Word - Document1');
      assert.deepEqual(pages, fakePages);
    });
    it('uploads and does not create thumbnails when pages is false', async function () {
      const { pages } = await dijixPdf.creationPipeline({ src: testPdfSrc, pages: false }, mockDijix);
      assert.equal(typeof pages, 'undefined', 'passed');
      dijixPdf = new DijixPDF({ pages: false });
      const { pages: pages2 } = await dijixPdf.creationPipeline({ src: testPdfSrc }, mockDijix);
      assert.equal(typeof pages2, 'undefined', 'constructor');
    });
  });
});
