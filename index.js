const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token, mensa_id, channel_id } = require('./config.json');
const additives = require('./additives.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {

    const getMeals = () => {

        const url = buildUrl();

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network error');
                }
                return response.json();
            })
            .then(responseText => {
                const mealMap = new Map();
                const categoriesMap = new Map();
                const hasTitleMap = new Map();
                const notesMap = new Map();
                const priceMap = new Map();

                for (let i = 0; i < responseText.length; i++) {
                    mealMap.set(i, responseText[i].name);
                    categoriesMap.set(responseText[i].name, responseText[i].category);
                    notesMap.set(responseText[i].name, responseText[i].notes);
                    priceMap.set(responseText[i].name, responseText[i].prices);
                }
                categoriesMap.forEach((value) => {
                    hasTitleMap.set(value, false);

                });

                let content = '>>> ';
                mealMap.forEach((value, key) => {
                    if (hasTitleMap.get(categoriesMap.get(mealMap.get(key))) === false) {
                        content += '### ' + categoriesMap.get(mealMap.get(key)) + '\n';
                        content += buildContent(key, value, priceMap, mealMap, notesMap);
                        hasTitleMap.set(categoriesMap.get(mealMap.get(key)), true);
                    } else {
                        content += buildContent(key, value, priceMap, mealMap, notesMap);
                    }
                });

                client.channels.fetch(channel_id).then(channel => {
                    channel.send(content);
                });
            })
            .catch(error => {
                console.error('There was a problem with the Fetch operation:', error);
            });
    }

    const buildUrl = () => {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `https://openmensa.org/api/v2/canteens/${mensa_id}/days/${year}-${month}-${day}/meals`;
    }

    const buildContent = (key, value, priceMap, mealMap, notesMap) => {
        let string = key + 1 + '. ' + value + ' (' + priceMap.get(mealMap.get(key)).students + ' €)\n';
        for (let i = 0; i < notesMap.get(mealMap.get(key)).length; i++) {
            for (const [k, v] of Object.entries(additives)) {
                if (!notesMap.get(mealMap.get(key))[i] === v) {
                    string += ' - ' + notesMap.get(mealMap.get(key))[i] + '\n';
                }
            }
        }
        return string;
    }

    const now = new Date();
    let millisTill8 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0) - now;
    if (millisTill8 < 0) {
        millisTill8 += 86400000;
    }

    setTimeout(() => {
        getMeals();
        setInterval(() => {
            getMeals()
        }, 86400000)
    }, millisTill8);

    getMeals();
});

client.login(token);