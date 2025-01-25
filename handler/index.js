const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { readdirSync } = require('fs');
const colors = require('colors');

module.exports = (client) => {
    // # slashCommands
    const arrayOfSlashCommands = [];

    const loadSlashCommands = (dir = "./commands/") => {
        readdirSync(dir).forEach(dirs => {
            const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));

            for (const files of commands) {
                try {
                    const getFileName = require(`../${dir}/${dirs}/${files}`);
                    client.slashCommands.set(getFileName.name, getFileName);
                    console.log(`[SLASH COMMANDS]`.bold.red + ` Loading command :`.bold.white + ` ${getFileName.name}`.bold.red);
                    arrayOfSlashCommands.push(getFileName);
                } catch (error) {
                    console.error(`[SLASH COMMANDS]`.bold.red + ` Error loading command :`.bold.white + ` ${files}`.bold.red, error);
                }
            }
        });

        setTimeout(async () => {
            try {
                console.log(`API >`.bold.white + ` Synchronizing all commands with Discord API.`.bold.green);
                await client.application.commands.set(arrayOfSlashCommands);
            } catch (error) {
                console.error(`[API SYNC]`.bold.red + ` Failed to synchronize commands:`, error);
            }
        }, 5000);
    };
    loadSlashCommands();

    console.log(`•----------•`.bold.black);

    // # events
    const loadEvents = (dir = "./events/") => {
        const dirs = readdirSync(dir);
        if (dirs.length === 0) {
            console.log(`[EVENTS]`.bold.red + ` No event directories found in: `.bold.yellow + `${dir}`.bold.red);
            return;
        }

        dirs.forEach(dirs => {
            const events = readdirSync(`${dir}/${dirs}`).filter(files => files.endsWith(".js"));

            if (events.length === 0) {
                console.log(`[EVENTS]`.bold.red + ` No event files found in: `.bold.yellow + `${dir}/${dirs}`.bold.red);
                return;
            }

            for (const files of events) {
                try {
                    const getFileName = require(`../${dir}/${dirs}/${files}`);
                    client.on(getFileName.name, (...args) => getFileName.execute(...args, client));
                    console.log(`[EVENTS]`.bold.red + ` Loading event :`.bold.white + ` ${getFileName.name}`.bold.red);
                } catch (error) {
                    console.error(`[EVENTS]`.bold.red + ` Error loading event :`.bold.white + ` ${files}`.bold.red, error);
                }
            }
        });
    };
    loadEvents();

    console.log(`•----------•`.bold.black);
};
