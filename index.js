#!/usr/bin/env node

const readline = require("readline");
const path = require("path");
const fs = require("fs");
const exec = require("child_process").exec;
const chalk = require("chalk");
const log = console.log;
const ora = require("ora");
const program = require("commander");
const currentPath = process.cwd();
program
  .version("0.1.0")
  .option("-d, --device", "Device")
  .parse(process.argv);

var selectedDevice = program.args.join(" ");

if (fs.existsSync(currentPath + "/package.json")) {
  exec("xcrun simctl list devices --json", (error, stdout, stderr) => {
    const simulators = JSON.parse(stdout);
    if (simulators.devices) {
      const devices = simulators.devices;
      let list = [];
      let copyList = [];
      Object.keys(devices).forEach(function(key, index) {
        const result = devices[key].filter(
          item => item.availability === "(available)"
        );
        list = list.concat(result);
      });
      copyList = list.map((item, index) => {
        return item.name;
      });
      list = list.map((item, index) => {
        return index + ".) " + item.name;
      });

      log(list.join("\n"));

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      if (selectedDevice) {
        const yourAnswer = copyList[selectedDevice];
        run(yourAnswer);
      } else {
        rl.question(chalk.green("Please Select Device \n"), answer => {
          const yourAnswer = copyList[answer];
          run(yourAnswer);
          rl.close();
        });
      }
    }
  });
} else {
  chalk.red("Not a React-Native project \n");
}

function run(param) {
  log(chalk.green("Selected Device => " + param));
  exec(
    'react-native run-ios --simulator="' + param + '"',
    (error, stdout, stderr) => {
      console.log(stdout);
      if (stderr == null) {
        const spinner = ora("Running on Simulator").start();
      }
      console.log("" + stderr);
    }
  );
}
