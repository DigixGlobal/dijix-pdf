/* globals window, PDFJS */
import 'pdfjs-dist';
import fs from 'fs';
import canvas from 'isomorphic-canvas';
import * as a from 'awaiting';

const defaultConfig = {
  pages: {
    maxWidth: 1024,
    thumbnails: {
      format: 'jpeg',
      quality: 0.7, // default
      64: true,
      256: true,
      512: true,
    },
  },
};

const isBrowser = typeof window !== 'undefined';

PDFJS.disableWorker = !isBrowser;
PDFJS.disableFontFace = !isBrowser;

/*
- read the pdf + data
- read the image data for each page
- upload the pages to IPFS (via DijixImage), set the data
- uplaod the raw PDF to ipfs
- return the dijix object
*/

export default class DijixPDF {
  constructor(config) {
    this.type = 'pdf';
    this.config = { ...defaultConfig, ...config };
  }
  async readInput(file) {
    // if we're in node, we pass a file path
    if (typeof file === 'string') {
      return new Uint8Array(fs.readFileSync(file));
    }
    // otherwise, it's a file object, in browser, use fileReader
    return new Promise((resolve) => {
      const reader = new window.FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsArrayBuffer(file);
    });
  }
  async getPagesData(data) {
    const pdf = PDFJS.getDocument(data);
    pdf.fileSize = data.byteLength;
    return pdf;
  }
  async getPagesImageData(pdf) {
    return a.map(Array.from(Array(pdf.pdfInfo.numPages).keys()), 1, async (i) => {
      const page = await pdf.getPage(i + 1);
      const scale = this.config.pages.maxWidth / page.pageInfo.view[2];
      const viewport = page.getViewport(scale);
      const c = canvas(viewport.width, viewport.height);
      const canvasContext = c.getContext('2d');
      await page.render({ canvasContext, viewport });
      return c.toDataURL();
    });
  }
  async generatePageThumbnails({ pdf, dijix }) {
    const pages = await this.getPagesImageData(pdf);
    // do this in series otherwise as thumbnails are in parralel
    // TODO pass watermark options
    const dijixObjects = await a.map(pages, 1, src => dijix.create('image', { src, config: { thumbnails: this.config.pages } }));
    return dijixObjects.map(({ ipfsHash }) => ipfsHash);
  }
  async creationPipeline(opts, dijix) {
    const data = await this.readInput(opts.src);
    const pdf = await this.getPagesData(data);
    const fileSize = pdf.loadingTask.fileSize;
    const pageCount = pdf.pdfInfo.numPages;
    const usePages = this.config.pages && opts.pages !== false;
    const pages = usePages && await this.generatePageThumbnails({ pdf, dijix, opts });
    const src = await dijix.ipfs.put(opts.src);
    const mime = 'application/pdf';
    const { info: { Title: title, ...metaData } } = await pdf.getMetadata();
    const file = typeof opts.src === 'string' && opts.src.match(/^(([A-Z]:)?[.]?[\\{1,2}/]?.*[\\{1,2}/])*(.+)\.(.+)/);
    // digix object
    const dijixObjectData = { fileSize, metaData, pageCount, src, mime };
    const fileName = opts.fileName || (file && `${file[3]}.pdf`);
    const name = opts.name || title;
    if (fileName) { dijixObjectData.fileName = fileName; }
    if (name) { dijixObjectData.name = name; }
    if (pages) { dijixObjectData.pages = pages; }
    return dijixObjectData;
  }
}
