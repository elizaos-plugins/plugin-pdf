
import {
    PdfService,
} from "./services/pdf";

export const browserPlugin = {
  name: "default",
  description: "Default plugin, with basic actions and evaluators",
  services: [new PdfService() as any],
  actions: [],
};

export default browserPlugin;