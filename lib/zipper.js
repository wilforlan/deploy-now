const fs = require('fs');
const archiver = require('archiver');
const archive = archiver('zip');

var Zipper = (function(config){
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
            var ignore = (config.ignore || []).concat(['*.zip','tmp/**/*','.tmp/**/*','.git/**/*',config.file]);

            if (config.debug) {
                console.info(displayLog);
                console.info("Ignoring Files: ", ignore.join(', '))
            }
            
            archive.on('error', function(err){
                reject(null);
                throw err;
            });
    
            archive.pipe(output);

            archive.glob('**/*', {
                cwd: config.projectDirectory+"/",
                dot: true,
                ignore: ignore,
            })
            archive.finalize();
        });
    };

    return {
        Archive
    }
});

module.exports = Zipper;