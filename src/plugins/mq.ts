import Vue from "vue";
import VueMq from "vue-mq";

Vue.use(VueMq, {
  breakpoints: { // default breakpoints - customize this
    mobile: 800,
    desktop: Infinity,
  },
  defaultBreakpoint: 'desktop' // customize this for SSR
});