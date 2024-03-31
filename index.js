const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token, mensa_id, channel_id } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {

    const additives = [
        'Vegetarisches Gericht',
        'Veganes Gericht',
        'Schwein',
        'Rind',
        'Wild',
        'Lamm',
        'Geflügel',
        'Fisch/Meeresfrüchte',
        'Insekten',
        'enthält Alkohol',
        'Klimateller',
        'Farbstoff',
        'Konservierungsstoff',
        'Antioxidationsmittel',
        'Geschmacksverstärker',
        'geschwefelt',
        'geschwärzt',
        'gewachst',
        'Phosphat',
        'Süßungsmitteln',
        'phenylalaninhaltig',
        'koffeinhaltig',
        'chininhaltig',
        'glutenhaltiges Getreide',
        'Weizen',
        'Roggen',
        'Gerste',
        'Hafer',
        'Dinkel',
        'Kamut',
        'Krebstiere',
        'Eier',
        'Fisch',
        'Erdnüsse',
        'Soja',
        'Milch/ Milchzucker',
        'Schalenfrüchte/ Nüsse',
        'Mandeln',
        'Haselnüsse',
        'Walnüsse',
        'Cashewnüsse',
        'Pekannüsse',
        'Paranüsse',
        'Macadamianüsse',
        'Sellerie',
        'Senf',
        'Sesam',
        'Sulfit/ Schwefeldioxid',
        'Lupine',
        'Weichtiere',
        'Insekten'
    ];

    const getMeals = () => {

        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const url = `https://openmensa.org/api/v2/canteens/${mensa_id}/days/${year}-${month}-${day}/meals`;

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
                        content += key + 1 + '. ' + value + ' (' + priceMap.get(mealMap.get(key)).students + ' €)\n'; // TODO dry code
                        for (let i = 0; i < notesMap.get(mealMap.get(key)).length; i++) {
                            if (!(additives.includes(notesMap.get(mealMap.get(key))[i]))) {
                                content += ' - ' + notesMap.get(mealMap.get(key))[i] + '\n';
                            }
                        }
                        hasTitleMap.set(categoriesMap.get(mealMap.get(key)), true);
                    } else {
                        content += key + 1 + '. ' + value + ' (' + priceMap.get(mealMap.get(key)).students + ' €)\n'; // TODO dry code
                        for (let i = 0; i < notesMap.get(mealMap.get(key)).length; i++) {
                            if (!(additives.includes(notesMap.get(mealMap.get(key))[i]))) {
                                content += ' - ' + notesMap.get(mealMap.get(key))[i] + '\n';
                            }
                        }
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

    getMeals()
});

client.login(token);