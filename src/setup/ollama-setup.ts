import http from 'http';
import chalk from 'chalk';

const modelName = process.env.OLLAMA_MODEL || 'llama3';
const payload = JSON.stringify({
    name: modelName,
});

const options = {
    hostname: process.env.OLLAMA_HOST || 'localhost',
    port: process.env.OLLAMA_PORT || 11434,
    path: '/api/pull',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

console.log(chalk.bgYellow('***') + ' ' + chalk.green(' Pulling ' + modelName + ' model. It make take several minutes. Please wait... ') + chalk.bgYellow('***\r\n'));

const req = http.request(options, (res) => {
    res.setEncoding('utf8');
    
    res.on('data', (chunk) => {
        console.info(chunk);
    });

    res.on('error', (error) => {
        console.error(chalk.bgRed('***') + chalk.white('An error occurred while pulling ' + modelName + ' model. ') + chalk.bgRed('***'))
        console.error(error);
    });

    res.on('end', () => {
        if (res.statusCode === 400) {
            console.error(chalk.bgRed('***') + chalk.white('Bad request. ') + chalk.bgRed('***'));
            process.exit(400)
        } else if (res.statusCode === 404) {
            console.error(chalk.bgRed('***') + chalk.white('Resource not found. ') + chalk.bgRed('***'));
            process.exit(404)
        } else {
            console.info(chalk.bgGreen('***') + chalk.white('Done! ' + modelName + ' is ready ') + chalk.bgGreen('***'));
            console.info('\n\n' + chalk.green('Now you can run: ' + chalk.bgYellowBright('docker-compose run app npm run dev') + ' to start the interactive shell'))
            process.exit(0)            
        }
    });
});

req.write(payload);
req.end();
//req.write(payload);
