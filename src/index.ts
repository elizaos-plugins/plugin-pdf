import type { Plugin } from "@elizaos/core";

import {
    PdfService,

} from "./services/pdf";

export const browserPlugin: Plugin = {
  name: "default",
  description: "Default plugin, with basic actions and evaluators",
  services: [new PdfService()],
  actions: [],
};

export default browserPlugin;