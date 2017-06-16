const http = require('http');
const exec = require('child_process').exec;
const config = require('./config.json');

const repo_name = config['repo_name'];
const tag = config['tag'];
const container_name = config['container_name'];
const flags = config['flags'];
function autoDeploy(json) {
    if (json['repository']['repo_name'] !== repo_name ||
        json['push_data']['tag'] !== tag) {
            console.log("no match config");
            return;
    };

    const command = `docker pull ${repo_name}:${tag} && \
    docker stop ${container_name} && \
    docker rm ${container_name} && \
    docker run --name ${container_name} -d ${flags} ${repo_name}:${tag}`;
    console.log(command);

    exec(command);
};


http.createServer((req, res) => {
    if (req.method != 'POST') req.connection.destroy();
    let body = '';
    
    req.on('data', buffer => {
        body += buffer;
        if (body.length > 1e6) {
            req.connection.destroy();
        }
    });

    req.on("end", () => {
        let json = JSON.parse(body);
        autoDeploy(json);
        res.end();
    });
}).listen(3000, () => {
    console.log('start');
});

