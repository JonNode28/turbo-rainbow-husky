#!/usr/bin/env node

import { Command } from 'commander'
import { exec, pwd, ls, set } from 'shelljs'
import fs from 'fs/promises'

const program = new Command()

program
  .name('service-deployment')
  .description('Deploys a service')

program.command('deploy')
  .option('--config', 'The path to the config file', 'service.config.json')
  .action(async (options) => {
    set('+e')
    exec('export')
    if(process.env.CI !== 'true'){
        process.env.GITHUB_HEAD_REF = exec('git rev-parse --abbrev-ref HEAD')
    }
    const configString = await fs.readFile(`./${options.config}`, 'utf-8')
      const config = JSON.parse(configString);
    console.log(`Deploying with config: ${JSON.stringify(config)}`)
    if(!process.env.GITHUB_HEAD_REF) throw new Error('Current branch is not specified')
    if(process.env.GITHUB_HEAD_REF !== 'main' && !process.env.PR_NUMBER) throw new Error('PR number is required to deploy non-prod envs')
    console.log('Logging into pl')
    exec('pulumi login s3://rainbow-husky-pulumi-state')
    const stack = process.env.GITHUB_HEAD_REF === 'main' ? `prod-${config.name}-service` : `dev-${process.env.PR_NUMBER}-${config.name}-service`
    exec(`pulumi stack select ${stack} -c`)
    exec('pulumi up --yes')
  })

program.parse()









// const { Command } = require('commander');
// const program = new Command();
//
// program
//   .name('string-util')
//   .description('CLI to some JavaScript string utilities')
//   .version('0.8.0');
//
// program.command('split')
//   .description('Split a string into substrings and display as an array')
//   .argument('<string>', 'string to split')
//   .option('--first', 'display just the first substring')
//   .option('-s, --separator <char>', 'separator character', ',')
//   .action((str, options) => {
//     const limit = options.first ? 1 : undefined;
//     console.log(str.split(options.separator, limit));
//   });
//
// program.parse();