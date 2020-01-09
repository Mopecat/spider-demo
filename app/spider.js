const puppeteer = require('puppeteer');
const chalk = require('chalk');
function formatProgress (current,TOTAL_PAGE) { 
    let percent = (current / TOTAL_PAGE) * 100
    let done = ~~(current / TOTAL_PAGE * 40)
    let left = 40 - done
    let str = `当前进度：[${''.padStart(done, '=')}${''.padStart(left, '-')}]  ${percent}%`
    return str
}
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://hhardyy.com/');
    const buttonClass = '.page-number'
    await page.waitForSelector(buttonClass)
    const TOTAL_PAGE = await page.evaluate(buttonClass=>{
        const arr = Array.from(document.body.querySelectorAll(buttonClass))

        return arr[3].textContent;
    },buttonClass)
    console.log(Number(TOTAL_PAGE))
    let allPost = []
    for(let i = 0;i<Number(TOTAL_PAGE);i++){
        if(i>0){
            const next = await page.$('.extend.next.waves-effect.waves-button')
            next.click()
            await page.waitForNavigation()
        }
        console.log(chalk.yellow(formatProgress(i,TOTAL_PAGE)))
        console.log(chalk.yellow('页面数据加载完毕'))
        const resultsSelector = '.post-title-link';
        await page.waitForSelector(resultsSelector);
        const links = await page.evaluate(resultsSelector=>{
            const anchors = Array.from(document.querySelectorAll(resultsSelector));
            return anchors.map(anchor=>{
                const title =  anchor.textContent;
                return `${title} -- ${anchor.href}`
            })
        },resultsSelector);
        allPost.push(...links)
        await page.waitFor(2500)
    }
    await browser.close();
    console.log(allPost)
})();