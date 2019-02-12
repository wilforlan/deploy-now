const fs = require('fs'),
    NodeSSH = require('node-ssh'),
    ssh = new NodeSSH();

const Shell = (function(config){
    const { zipped, cmd } = config;
    let { serverProjectRoot } = config;
    // fix server root with forward slash
    if(!serverProjectRoot.endsWith('/')) serverProjectRoot = serverProjectRoot + '/'
    const logger = log => {
        console.log("[DEPLOY-NOW] "+log)
    }

    const uploadArchive = async () => {
        logger("Starting Archive Upload!");
        await ssh.putFile(zipped.output, serverProjectRoot+zipped.name);
        logger("Archive Upload Done!");
    };

    const commandSeries = async () => {
        await ssh.execCommand(`unzip -o ${zipped.name}`, { 
            cwd: serverProjectRoot,
            onStderr(chunk) {
                logger('UNZIPPING ERROR', chunk.toString('utf8'))
                process.exit(1);
            }
        })
        await ssh.execCommand(`rm -f ${zipped.name}`, { 
            cwd: serverProjectRoot,
            onStderr(chunk) {
                logger('UNZIPPING ERROR', chunk.toString('utf8'))
                process.exit(1);
            }
        })
    };

    const output = (list) => {
        list.forEach( l => logger(l.stdout) );
    };

    const outerCommandSeries = async (afterDone, type) => {
        var allCommands = [];
        config.cmd.forEach( command => allCommands.push(ssh.execCommand(command, { 
            cwd: serverProjectRoot,
            stream: 'stdout'
        })))
        Promise.all(allCommands).then( result => {
            output(result);
            afterDone(type);
        }).catch(err => {
            logger("ERROR EXECUTING COMMANDS", err);
            process.exit(0);
        })
    };

    const end = async (type) => {
        let ended = await ssh.execCommand(`rm ${zipped.name}`, { 
            cwd: serverProjectRoot,
        });
        logger("Deploy done!");
        if(type === "close") {
            ssh.dispose(); 
            process.exit(0);
        }
        return ended;
    };

    const Start = async () => {
        var opts = {
            host: config.host,
            username: config.user,
            port: config.port || 22
        }
        if(config.password) opts.password = config.password;
        if(config.privateKey) opts.privateKey = config.privateKey
        if(config.publicKey) opts.publicKey = config.publicKey
        let openState = config.autosync ? 'leaveOpen' : 'close';
        if(openState === 'leaveOpen')  opts.keepaliveInterval = 700000; opts.keepaliveCountMax = 100;
        try {
            if(!ssh.connection) await ssh.connect(opts);
            await uploadArchive()
            await commandSeries();
            return outerCommandSeries(end, openState);
        } catch (error) {
            logger(error)
            process.exit(1);
        }
    };

    return {
        Start
    }

});

module.exports = Shell;