const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token, mensa_id, channel_id } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1; // +1 is necessary because months start at 0
    const year = date.getFullYear();
    const url = 'https://openmensa.org/api/v2/canteens/' + mensa_id + '/days/' + year + '-' + month + '-' + day + '/meals';

    if (!(date.getDay === 0 && date.getDate === 6)) {
        fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } throw new Error('Reqest failed!');}, networkError => {
                console.log(networkError.message);
            })
        .then((responseText) => {

            const mealMap = new Map();
            const categoriesMap = new Map();
            const hasTitleMap = new Map();

            for (let i = 0; i < responseText.length; i++) {
                mealMap.set(i, responseText[i].name);
                categoriesMap.set(responseText[i].name, responseText[i].category);
            }

            categoriesMap.forEach((value, key) => {
                hasTitleMap.set(value, false);
            });

            let content = '>>> ';
            mealMap.forEach((value, key) => {
                if (hasTitleMap.get(categoriesMap.get(mealMap.get(key))) === false) {
                    content += '### ' + categoriesMap.get(mealMap.get(key)) + '\n';
                    content += value + '\n';
                    hasTitleMap.set(categoriesMap.get(mealMap.get(key)), true);
                } else {
                    content += value + '\n';
                }
            });
            
            client.channels.fetch(channel_id).then(channel => {
                channel.send(content);
            });
        });
    }

});

client.login(token);