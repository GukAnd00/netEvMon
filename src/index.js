import "source-map-support/register";
import "@babel/polyfill";

import "./models/index";

import httpApp from "./server";

httpApp.init();
