import { IHyperPugFilters } from "hyperpug";
import { ShowdownExtension } from "showdown";

const plugins: {
  pug: IHyperPugFilters;
  markdown: Record<string, ShowdownExtension>;
} = {
  pug: {},
  markdown: {}
};

export default plugins;