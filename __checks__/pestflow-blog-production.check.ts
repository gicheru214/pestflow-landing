import path from "node:path";
import { BrowserCheck, Frequency } from "checkly/constructs";

new BrowserCheck("pestflow-blog-production", {
  name: "PestFlow landing blog publishes generated posts",
  description: "Checks the Railway production landing blog and the newest generated blog slugs.",
  frequency: Frequency.EVERY_24H,
  locations: ["us-east-1"],
  tags: ["pestflow", "landing", "blog", "railway"],
  code: {
    entrypoint: path.join(__dirname, "pestflow-blog-production.spec.ts"),
  },
});
