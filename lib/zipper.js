const fs = require('fs');
const archiver = require('archiver');
let archive = archiver('zip');
const { stripProjectDirectory } = require('./helpers');

var Zipper = (function(config){

    const stripLocalToRemote = (arr, projectDirectory) => {
        let projectFolder = stripProjectDirectory(projectDirectory)
        return arr.map(path => {
            path.file = path.name ;
            projectFolder = projectFolder.replace('/','')
            let index = path.name.indexOf(projectFolder);
            path.name = `${path.name.substring((index + projectFolder.length) + 1, path.name.length)}`
            return path
        })
    }

    const Archive = () => {
        return new Promise((resolve, reject) => {
            var name = "DeployNow-"+config.name+".zip"
            var o = config.projectDirectory+"/"+config.tmp_store+"/"+name;
            var output = fs.createWriteStream(o);
            output.on('close', function () {
                console.log("Archive: ", o);
                return resolve({ output: o, name: name });
            });            

            var displayLog = `Archiving Source: ${config.projectDirectory} \n\nDestination: ${o}`
            var ignore = config.ignore

            if (config.debug) {
                console.info(displayLog);
                console.info("Ignoring Files: ", ignore.join(', '))
            }
            
            archive.on('error', function(err){
                reject(err);
                throw err;
            });
    
            archive.pipe(output);

            if(config.autosync && config.paths){
                stripLocalToRemote(config.paths, config.projectDirectory).forEach( path => {
                    archive.file(path.file, { name: path.name });
                });
            }else{
                var scanDir = `${config.projectDirectory }${!config.projectDirectory.endsWith('/') ? "/" : ''}`;
                archive.glob('**/*', {
                    cwd: scanDir,
                    dot: true,
                    ignore: ignore.filter( e => e), // use filter to remove null or undefined
                })
            }
            archive.finalize();
            // create new archiver object
            // https://github.com/archiverjs/node-archiver/issues/143
            archive = archiver('zip');
        });
    };

    return {
        Archive
    }
});

module.exports = Zipper;