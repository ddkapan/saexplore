#!/usr/bin/env node
/* Minimal CDP screenshot tool — real mobile-viewport emulation, no puppeteer.
 *
 * Why: headless Chrome pins its layout viewport to ~500px regardless of --window-size,
 * so plain --screenshot can't render a true phone width. This drives Chrome's DevTools
 * Protocol directly (Emulation.setDeviceMetricsOverride) over a hand-rolled WebSocket
 * client (this Node has no `ws` / global WebSocket), giving accurate device emulation.
 *
 * Setup (once): launch Chrome headless with remote debugging, e.g.
 *   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
 *     --disable-gpu --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-prof about:blank &
 *
 * Usage:
 *   node cdpshot.js <fileURL> <out.png> <width> <height> [dsf=3] [fullPage=1]
 *   iPhone 16 Pro:  node cdpshot.js file://$PWD/index.html ip.png 393 852 3 1
 *
 * Env knobs:
 *   EVALJS=<expr>   run JS in the page before capture (drive interactions)
 *   SCROLLY=<px>    window.scrollTo(0, px) before capture
 *   PRINT=1         emulate print media (Emulation.setEmulatedMedia media:print)
 */
const net = require('net');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

const [, , URL_, OUT, W, H, DSF = '3', FULL = '1'] = process.argv;
const width = +W, height = +H, dsf = +DSF, full = FULL === '1';

function getTargets() {
  return new Promise((res, rej) => {
    http.get('http://127.0.0.1:9222/json', r => {
      let b = ''; r.on('data', d => b += d); r.on('end', () => res(JSON.parse(b)));
    }).on('error', rej);
  });
}

// ---- tiny WebSocket client (client->server frames masked; parse server frames) ----
function wsConnect(wsUrl) {
  return new Promise((res, rej) => {
    const u = new URL(wsUrl);
    const key = crypto.randomBytes(16).toString('base64');
    const sock = net.connect(+u.port, u.hostname, () => {
      sock.write(
        `GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\n` +
        `Connection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
    });
    let handshook = false, buf = Buffer.alloc(0);
    const listeners = [];
    sock.on('data', chunk => {
      buf = Buffer.concat([buf, chunk]);
      if (!handshook) {
        const i = buf.indexOf('\r\n\r\n');
        if (i < 0) return;
        buf = buf.slice(i + 4); handshook = true; res(api);
      }
      for (;;) {
        if (buf.length < 2) break;
        const b1 = buf[1], masked = b1 & 0x80; let len = b1 & 0x7f, off = 2;
        if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        const total = off + (masked ? 4 : 0) + len;
        if (buf.length < total) break;
        const payload = buf.slice(off + (masked ? 4 : 0), total);
        buf = buf.slice(total);
        const text = payload.toString('utf8');
        listeners.forEach(fn => fn(text));
      }
    });
    sock.on('error', rej);
    let id = 0; const pending = {};
    function frame(str) {
      const p = Buffer.from(str, 'utf8'); const len = p.length;
      const mask = crypto.randomBytes(4); let head;
      if (len < 126) head = Buffer.from([0x81, 0x80 | len]);
      else if (len < 65536) { head = Buffer.alloc(4); head[0] = 0x81; head[1] = 0x80 | 126; head.writeUInt16BE(len, 2); }
      else { head = Buffer.alloc(10); head[0] = 0x81; head[1] = 0x80 | 127; head.writeBigUInt64BE(BigInt(len), 2); }
      const out = Buffer.alloc(len); for (let i = 0; i < len; i++) out[i] = p[i] ^ mask[i & 3];
      sock.write(Buffer.concat([head, mask, out]));
    }
    listeners.push(text => {
      let m; try { m = JSON.parse(text); } catch { return; }
      if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
    });
    const api = {
      send(method, params) { return new Promise(r => { const i = ++id; pending[i] = r; frame(JSON.stringify({ id: i, method, params: params || {} })); }); },
      close() { sock.end(); }
    };
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const targets = await getTargets();
  const page = targets.find(t => t.type === 'page') || targets[0];
  const cdp = await wsConnect(page.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: dsf, mobile: true, screenWidth: width, screenHeight: height });
  await cdp.send('Runtime.enable');
  await cdp.send('Page.navigate', { url: URL_ });
  await sleep(1800); // let data.js + first render settle
  if (process.env.EVALJS) { await cdp.send('Runtime.evaluate', { expression: process.env.EVALJS }); await sleep(500); }
  if (process.env.SCROLLY) { await cdp.send('Runtime.evaluate', { expression: 'window.scrollTo(0,' + (+process.env.SCROLLY) + ')' }); await sleep(300); }
  if (process.env.PRINT) { await cdp.send('Emulation.setEmulatedMedia', { media: 'print' }); await sleep(300); }
  let clip;
  if (full) {
    const lm = await cdp.send('Page.getLayoutMetrics');
    const cs = lm.result.cssContentSize || lm.result.contentSize;
    clip = { x: 0, y: 0, width, height: Math.ceil(cs.height), scale: 1 };
  }
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full, clip });
  fs.writeFileSync(OUT, Buffer.from(shot.result.data, 'base64'));
  console.log('wrote', OUT);
  cdp.close();
  process.exit(0);
})().catch(e => { console.error('ERR', e && e.message); process.exit(1); });
