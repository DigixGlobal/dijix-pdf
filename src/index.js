/* globals window, PDFJS */
import 'pdfjs-dist';
import fs from 'fs';
import canvas from '@hitchcott/isomorphic-canvas';
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

global.HTMLElement = typeof HTMLElement === 'undefined' ? class HTMLElement {} : global.HTMLElement;
global.Image = typeof Image === 'undefined' ? canvas.Image : global.Image;

const isBrowser = typeof window !== 'undefined';

class CanvasFactory {
  create(width, height) {
    if (width <= 0 || height <= 0) {
      throw new Error('invalid canvas size');
    }
    const c = canvas(width, height);
    return {
      canvas: c,
      context: c.getContext('2d'),
    };
  }
  destroy() { }
  reset() { }
}

const canvasFactory = new CanvasFactory();

PDFJS.workerSrc = 'pdf.worker.bundle.js';
PDFJS.disableWorker = !isBrowser;
PDFJS.disableFontFace = !isBrowser;

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
  async generatePageThumbnails({ pdf, dijix }) {
    return a.map(Array.from(Array(pdf.pdfInfo.numPages).keys()), 1, async (i) => {
      const page = await pdf.getPage(i + 1);
      const scale = this.config.pages.maxWidth / page.pageInfo.view[2];
      const viewport = page.getViewport(scale);
      const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
      await page.render({ canvasContext: canvasAndContext.context, viewport, canvasFactory });
      const src = canvasAndContext.canvas.toDataURL();
      const { ipfsHash } = await dijix.create('image', { src, config: { thumbnails: this.config.pages } });
      return ipfsHash;
    });
  }
  async creationPipeline(opts, dijix) {
    const data = await this.readInput(opts.src);
    const pdf = await this.getPagesData(data);
    const fileSize = pdf.loadingTask.fileSize;
    const pageCount = pdf.pdfInfo.numPages;
    const usePages = opts.pages !== false && (this.config.pages || opts.pages);
    const pages = !!usePages && await this.generatePageThumbnails({ pdf, dijix, opts });
    const src = await dijix.ipfs.put(Buffer.from(data));
    const mime = 'application/pdf';
    const metaData = {};
    const file = typeof opts.src === 'string' && opts.src.match(/^(([A-Z]:)?[.]?[\\{1,2}/]?.*[\\{1,2}/])*(.+)\.(.+)/);
    // digix object
    const dijixObjectData = { fileSize, metaData, pageCount, src, mime };
    const fileName = opts.fileName || (file && `${file[3]}.pdf`);
    const name = opts.name;
    if (fileName) { dijixObjectData.fileName = fileName; }
    if (name) { dijixObjectData.name = name; }
    if (pages) { dijixObjectData.pages = pages; }
    return dijixObjectData;
  }
}
