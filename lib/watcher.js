const watcher = require('node-watch');
const { stripProjectDirectory } = require('./helpers');

const Watcher = (function(config){
    const { 
        projectDirectory, 
        watchRecursive = true,
        runAfter = 10000,
        ignore = []
    } = config;
    let watcherData = {
        changedPaths: []
    };

    let mirrorTimeOut;

    const logger = (log, type) => {
        type = type || 'log'
        console[type](`[DEPLOY-NOW] ${log}`);
    };

    // TODO: find a better way to do this!
    const getUniquePaths = (arr) => {
        const unique = arr
            .sort((a, b) => a.ts < b.ts ) // sort the file such that the latest one stays at the top
            .map(e => e.name)
            .map((e, i, final) => final.indexOf(e) === i && i ) // store the keys of the unique objects
            .filter(e => arr[e]) // eliminate the dead keys & store unique objects
            .map(e =>  arr[e]);
        return unique;
    }

    const sshUpload = (DeployCommand, deployCommandOpts, paths) => {
        deployCommandOpts.paths = paths
        DeployCommand({ ...config, ...deployCommandOpts}).then(() => {
            paths.forEach(path => {
                watcherData.changedPaths = watcherData.changedPaths.filter( p => p.name !== path.name || p.ts !== path.ts);
            });
        }).catch(err => {
            logger(`[SYNC] ERROR: ${err}`);
        });
    };

    // We do not want to mirror immediately. So run after some minutes (config.runAfter)
    const mirrorAfter = (file, runAfterMs, DeployCommand, deployCommandOpts) => {
        logger(`[SYNC] File ${file} changed`);
        if(mirrorTimeOut) clearTimeout(mirrorTimeOut);
        let fileInfo = { name: file, ts: Date.now()}
        watcherData.changedPaths.push(fileInfo);
        mirrorTimeOut = setTimeout(() => {
            if(watcherData.changedPaths.length < 1) return;
            let uniqPaths = getUniquePaths(watcherData.changedPaths);
            logger("[SYNC] Files to Mirror");
            logger(uniqPaths.map(p => p.name ));
            sshUpload(DeployCommand, deployCommandOpts, uniqPaths)
        }, runAfterMs);
    };

    const findOriginalPath = (projectFolder, path) => {
        projectFolder = projectFolder.replace('/','')
        let index = path.indexOf(projectFolder);
        return `${path.substring((index + projectFolder.length) + 1, path.length)}`
    };

    const removeAsterikBefore = (string) => {
        var indices = [];
        for(var i = 0; i < string.length; i++) {
            if (string[i] === "*") indices.push(i);
        }
        var startFrom = Math.max.apply(null, indices);
        return string.substring(startFrom + 1, string.length)

    };

    const Start = (DeployCommand, deployCommandOpts) => {
        logger("[SYNC] Yay! I am ready :(")
        let opts = {
            recursive: watchRecursive
        };
        let projectFolder = stripProjectDirectory(projectDirectory)
        ignore.push('DeployNow')
        if(ignore.length > 0) {
            opts.filter = (file) => {
                var match = true 
                for (let index = 0; index < ignore.length; index++) {
                    let regex = ignore[index];
                    if(!regex) continue;
                    /**
                     * Remove * from regex, it results to `Nothing to repeat`
                     * If regex starts with *, pick next strings
                     * If it's in between pick ones before
                     */
                    var hasAsterik = regex.indexOf('*') !== -1
                    if(!regex.startsWith('*') && hasAsterik) regex = regex.substring(0, regex.indexOf('*'))
                    if(regex.startsWith('*') && hasAsterik) regex = removeAsterikBefore(regex);
                    let match = (new RegExp(regex).test(findOriginalPath(projectFolder, file)))
                    if(match) return false;
                }
                return match;
            }
        }
        watcher(projectDirectory, opts, function(evt, name) {
            mirrorAfter(name, runAfter, DeployCommand, deployCommandOpts);
        });
    };

    return {
        Start
    }
});

module.exports = Watcher