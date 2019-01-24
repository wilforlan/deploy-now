const fs = require('fs');
const jsonfile = require('jsonfile');
const arrayContainsArray = require("./helpers").arrayContainsArray;
const mkdirp = require('mkdirp');

const projectDirectory = process.cwd();
const configuration = {
    projectDirectory,
    file: "deploy-now.json",
    required: ['name','host','user'], // required keys
    tmp_store: "tmp/deploy-now"
};
var Loader = (function(){

    const Init = () => {
        mkdirp.sync(projectDirectory+"/"+configuration.tmp_store);
    };

    const validateConfig = config => {
        if(!arrayContainsArray(Object.keys(config), configuration.required)) throw `${configuration.required} are required in config file`;
    };

    const Config = async () => {
        const configPath = projectDirectory+"/"+configuration.file;
        if (!fs.existsSync(configPath)) throw "Deploy Now config file not found";
        const config = await jsonfile.readFile(configPath);
        validateConfig(config);
        return { ...config, ...configuration };
    };

    return {
        Init,
        Config
    }
})();

module.exports = Loader;