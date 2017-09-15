'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

require('pdfjs-dist');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _isomorphicCanvas = require('@hitchcott/isomorphic-canvas');

var _isomorphicCanvas2 = _interopRequireDefault(_isomorphicCanvas);

var _awaiting = require('awaiting');

var a = _interopRequireWildcard(_awaiting);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* globals window, PDFJS */
var defaultConfig = {
  pages: {
    maxWidth: 1024,
    thumbnails: {
      format: 'jpeg',
      quality: 0.7, // default
      64: true,
      256: true,
      512: true
    }
  }
};

global.HTMLElement = typeof HTMLElement === 'undefined' ? function HTMLElement() {
  (0, _classCallCheck3.default)(this, HTMLElement);
} : global.HTMLElement;
global.Image = typeof Image === 'undefined' ? _isomorphicCanvas2.default.Image : global.Image;

var isBrowser = typeof window !== 'undefined';

var CanvasFactory = function () {
  function CanvasFactory() {
    (0, _classCallCheck3.default)(this, CanvasFactory);
  }

  (0, _createClass3.default)(CanvasFactory, [{
    key: 'create',
    value: function create(width, height) {
      if (width <= 0 || height <= 0) {
        throw new Error('invalid canvas size');
      }
      var c = (0, _isomorphicCanvas2.default)(width, height);
      return {
        canvas: c,
        context: c.getContext('2d')
      };
    }
  }, {
    key: 'destroy',
    value: function destroy() {}
  }, {
    key: 'reset',
    value: function reset() {}
  }]);
  return CanvasFactory;
}();

var canvasFactory = new CanvasFactory();

PDFJS.workerSrc = 'pdf.worker.bundle.js';
PDFJS.disableWorker = !isBrowser;
PDFJS.disableFontFace = !isBrowser;

var DijixPDF = function () {
  function DijixPDF(config) {
    (0, _classCallCheck3.default)(this, DijixPDF);

    this.type = 'pdf';
    this.config = (0, _extends3.default)({}, defaultConfig, config);
  }

  (0, _createClass3.default)(DijixPDF, [{
    key: 'readInput',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(file) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(typeof file === 'string')) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return', new Uint8Array(_fs2.default.readFileSync(file)));

              case 2:
                return _context.abrupt('return', new _promise2.default(function (resolve) {
                  var reader = new window.FileReader();
                  reader.onload = function () {
                    return resolve(reader.result);
                  };
                  reader.readAsArrayBuffer(file);
                }));

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function readInput(_x) {
        return _ref.apply(this, arguments);
      }

      return readInput;
    }()
  }, {
    key: 'getPagesData',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(data) {
        var pdf;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                pdf = PDFJS.getDocument(data);

                pdf.fileSize = data.byteLength;
                return _context2.abrupt('return', pdf);

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getPagesData(_x2) {
        return _ref2.apply(this, arguments);
      }

      return getPagesData;
    }()
  }, {
    key: 'generatePageThumbnails',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_ref4) {
        var _this = this;

        var pdf = _ref4.pdf,
            dijix = _ref4.dijix;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt('return', a.map((0, _from2.default)(Array(pdf.pdfInfo.numPages).keys()), 1, function () {
                  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(i) {
                    var page, scale, viewport, canvasAndContext, src, _ref6, ipfsHash;

                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            console.log('processing PDF page ' + (i + 1) + ' of ' + pdf.pdfInfo.numPages);
                            _context3.next = 3;
                            return pdf.getPage(i + 1);

                          case 3:
                            page = _context3.sent;
                            scale = _this.config.pages.maxWidth / page.pageInfo.view[2];
                            viewport = page.getViewport(scale);
                            canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
                            _context3.next = 9;
                            return page.render({ canvasContext: canvasAndContext.context, viewport: viewport, canvasFactory: canvasFactory });

                          case 9:
                            src = canvasAndContext.canvas.toDataURL();
                            _context3.next = 12;
                            return dijix.create('image', { src: src, config: { thumbnails: _this.config.pages } });

                          case 12:
                            _ref6 = _context3.sent;
                            ipfsHash = _ref6.ipfsHash;
                            return _context3.abrupt('return', ipfsHash);

                          case 15:
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee3, _this);
                  }));

                  return function (_x4) {
                    return _ref5.apply(this, arguments);
                  };
                }()));

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function generatePageThumbnails(_x3) {
        return _ref3.apply(this, arguments);
      }

      return generatePageThumbnails;
    }()
  }, {
    key: 'creationPipeline',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(opts, dijix) {
        var data, pdf, fileSize, pageCount, usePages, pages, src, mime, title, metaData, file, dijixObjectData, fileName, name;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.readInput(opts.src);

              case 2:
                data = _context5.sent;
                _context5.next = 5;
                return this.getPagesData(data);

              case 5:
                pdf = _context5.sent;
                fileSize = pdf.loadingTask.fileSize;
                pageCount = pdf.pdfInfo.numPages;
                usePages = opts.pages !== false && (this.config.pages || opts.pages);
                _context5.t0 = !!usePages;

                if (!_context5.t0) {
                  _context5.next = 14;
                  break;
                }

                _context5.next = 13;
                return this.generatePageThumbnails({ pdf: pdf, dijix: dijix, opts: opts });

              case 13:
                _context5.t0 = _context5.sent;

              case 14:
                pages = _context5.t0;
                _context5.next = 17;
                return dijix.ipfs.put(Buffer.from(data));

              case 17:
                src = _context5.sent;
                mime = 'application/pdf';
                // const { info: { Title: title, ...metaData } } = {}; //{} await pdf.getMetadata();

                title = 'test';
                metaData = {};
                file = typeof opts.src === 'string' && opts.src.match(/^(([A-Z]:)?[.]?[\\{1,2}/]?.*[\\{1,2}/])*(.+)\.(.+)/);
                // digix object

                dijixObjectData = { fileSize: fileSize, metaData: metaData, pageCount: pageCount, src: src, mime: mime };
                fileName = opts.fileName || file && file[3] + '.pdf';
                name = opts.name || title;

                if (fileName) {
                  dijixObjectData.fileName = fileName;
                }
                if (name) {
                  dijixObjectData.name = name;
                }
                if (pages) {
                  dijixObjectData.pages = pages;
                }
                return _context5.abrupt('return', dijixObjectData);

              case 29:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function creationPipeline(_x5, _x6) {
        return _ref7.apply(this, arguments);
      }

      return creationPipeline;
    }()
  }]);
  return DijixPDF;
}();

exports.default = DijixPDF;