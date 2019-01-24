#!/usr/bin/env node

const Loader = require("./lib/loader");
const Zipper = require("./lib/zipper");
const Shell = require("./lib/shell");
(async () => {
    Loader.Init();
    try {
        let config = await Loader.Config();
        var zipped = await Zipper(config).Archive();
        config = { ...config, zipped }
        Shell(config).Start();
    } catch (error) {
        console.error("[DEPLOY-NOW] ERROR: "+ error)
    }
})();