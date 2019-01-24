const fs = require('fs'),
    NodeSSH = require('node-ssh'),
    ssh = new NodeSSH();

const Shell = (function(config){
    const { zipped, serverProjectRoot, cmd } = config;

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
    };

    const output = (list) => {
        list.forEach( l => logger(l.stdout) );
    }
    const outerCommandSeries = async (afterDone) => {
        var allCommands = [];
        config.cmd.forEach( command => allCommands.push(ssh.execCommand(command, { 
            cwd: serverProjectRoot,
            stream: 'stdout'
        })))
        Promise.all(allCommands).then( result => {
            output(result);
            afterDone();
        }).catch(err => {
            logger("ERROR EXECUTING COMMANDS", err);
            process.exit(0);
        })
    };

    const end = async () => {
        await ssh.execCommand(`rm ${zipped.name}`, { 
            cwd: serverProjectRoot,
        });
        logger("Deploy done!");
        process.exit(0);
    };

    const Start = async () => {
        var opts = {
            host: config.host,
            username: config.user,
            port: config.port || 22
        }
        if(config.password){
            opts.password = config.password;
        }

        if(config.privateKey) opts.privateKey = config.privateKey
        try {
            await ssh.connect(opts);
            await uploadArchive()
            await commandSeries();
            outerCommandSeries(end);
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