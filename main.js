import { chromium } from 'playwright';
import express from 'express'

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send({
    "message": "ok"
  })
})

const parseBool = (str) => {
  if (str === 'true' || str === 'True') {
    return true
  } else if (str === 'false' || str === 'False') {
    return false
  }
}

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.160 Safari/537.36'

app.post('/', async (req, res) => {
  console.log(req.body);
  if (req.body) {
    if ('url' in req.body &&
      'selector' in req.body &&
      typeof req.body.url === 'string' &&
      typeof req.body.selector === 'string' &&
      req.body.url.length !== 0 &&
      req.body.selector.length !== 0
    ) {
      try {
        const browser = await chromium.launch();
        const page = await browser.newPage({
          userAgent
        });
        await page.goto(req.body.url);
        const data = await page.locator(req.body.selector).innerText()
        await browser.close();
        res.send({
          "data": parseBool(req.query.parseInt?.toString() ?? 'false') ? parseInt(data.replace(/\W/g, ''), 10) : data
        })
      } catch (e) {
        console.log(e);
        res.status(500).send({
          "message": "timeout"
        })
      }
    } else {
      res.status(400).send({
        "message": "url and selector is required and must be a not empty string"
      })
    }
  } else {
    res.status(400).send({
      "message": "body is required"
    })
  }
})

app.listen(3000, '0.0.0.0', () => {
  console.log('Server started for 0.0.0.0:3000');
})