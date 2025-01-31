// src/services/pdf.ts
import {
  Service,
  ServiceType
} from "@elizaos/core";
import { getDocument } from "pdfjs-dist";
var _PdfService = class _PdfService extends Service {
  constructor() {
    super();
  }
  getInstance() {
    return _PdfService.getInstance();
  }
  async initialize(_runtime) {
  }
  async convertPdfToText(pdfBuffer) {
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdf = await getDocument({ data: uint8Array }).promise;
    const numPages = pdf.numPages;
    const textPages = [];
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.filter(isTextItem).map((item) => item.str).join(" ");
      textPages.push(pageText);
    }
    return textPages.join("\n");
  }
};
_PdfService.serviceType = ServiceType.PDF;
var PdfService = _PdfService;
function isTextItem(item) {
  return "str" in item;
}

// src/index.ts
var browserPlugin = {
  name: "default",
  description: "Default plugin, with basic actions and evaluators",
  services: [new PdfService()],
  actions: []
};
var index_default = browserPlugin;
export {
  browserPlugin,
  index_default as default
};
//# sourceMappingURL=index.js.map