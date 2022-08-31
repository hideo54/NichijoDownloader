import scrapeIt from 'scrape-it';
import axios from 'axios';
import download from 'download';

const origin = 'https://web-ace.jp';

const sleep = (seconds: number) => new Promise(resolve =>
    setTimeout(resolve, seconds * 1000)
);

interface Episode {
    num: string;
    title: string;
    url: string;
}

const getEpisodes = async () => {
    const url = origin + '/youngaceup/contents/1000069/episode/';
    const { data } = await scrapeIt<{
        episodes: Episode[];
    }>(url, {
        episodes: {
            listItem: 'li.table-view-cell.media',
            data: {
                num: 'p.text-bold',
                title: 'h3',
                url: {
                    selector: 'a.navigate-right',
                    attr: 'href',
                    convert: s => origin + s,
                },
            },
        },
    });
    return data.episodes;
};

const downloadImages = async (episode: Episode) => {
    const { data: imagePaths } = await axios.get<string[]>(episode.url + 'json/');
    const imageUrls = imagePaths.map(path => origin + path);
    const downloadDir = `${__dirname}/dist/${episode.num}/`;
    for (const imageUrl of imageUrls) {
        await download(imageUrl, downloadDir);
        process.stdout.write('.');
        await sleep(3);
    }
    console.log(`\nDownload done: ${episode.num}`);
};

const main = async () => {
    const episodes = await getEpisodes();
    for (const episode of episodes) {
        await downloadImages(episode);
        await sleep(5);
    }
};

main();
