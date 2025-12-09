#!/usr/bin/env node

const https = require('https');

const username = process.argv[2];

if (!username) {
    console.log("Usage: github-activity <github-username>");
    process.exit(1);
}

const url = `https://api.github.com/users/${username}/events`;
const options = {
    headers: {
        'User-Agent': 'node.js'
    }
};

https.get(url, options, (res) => {
    let data = '';

    if (res.statusCode !== 200) {
        console.log(`Error: Failed to fetch data. Status code: ${res.statusCode}`);
        res.resume();
        return;
    }

    res.on('data', (chunk) => { data += chunk; });

    res.on('end', () => {
        try {
            const events = JSON.parse(data);

            if (!events || events.length === 0) {
                console.log("No recent activity found.");
                return;
            }

            events.slice(0, 10).forEach((event) => {
                switch(event.type) {
                    case 'PushEvent':
                        const commitCount = event.payload.commits ? event.payload.commits.length : 0;
                        console.log(`Pushed ${commitCount} commits to ${event.repo.name}`);
                        break;
                    case 'IssuesEvent':
                        const actionIssue = event.payload.action || 'performed';
                        console.log(`${actionIssue} an issue in ${event.repo.name}`);
                        break;
                    case 'PullRequestEvent':
                        const actionPR = event.payload.action || 'performed';
                        console.log(`${actionPR} a pull request in ${event.repo.name}`);
                        break;
                    case 'WatchEvent':
                        console.log(`Starred ${event.repo.name}`);
                        break;
                    default:
                        console.log(`${event.type} in ${event.repo.name}`);
                }
            });
        } catch (e) {
            console.log("Error parsing JSON data:", e.message);
        }
    });
}).on('error', (err) => {
    console.log("Error:", err.message);
});
