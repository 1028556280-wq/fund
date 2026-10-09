// Cloudflare Pages Functions: functions/api/lsjz.js
// 同域代理：前端 /api/lsjz -> 服务器侧带 Referer 抓取东财 F10 动态净值接口
// 这样前端(无论 file:// 还是 Pages 域名)都无需自己带 Referer，解决快源不可达问题
// 部署到 Vercel 时，把本文件放到 api/lsjz.js 并加 export const config={runtime:'edge'} 即可

export const onRequestGet = async ({ request }) => {
  const u = new URL(request.url);
  const code = u.searchParams.get('code');
  const date = u.searchParams.get('date') || '';
  const callback = u.searchParams.get('callback') || '';
  if (!code) {
    return new Response('missing code', { status: 400 });
  }
  const upstream =
    'https://api.fund.eastmoney.com/f10/lsjz?callback=' + encodeURIComponent(callback) +
    '&fundCode=' + encodeURIComponent(code) +
    '&pageIndex=1&pageSize=10' +
    '&startDate=' + encodeURIComponent(date) +
    '&endDate=' + encodeURIComponent(date) +
    '&_=' + Date.now();
  const resp = await fetch(upstream, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Referer': 'https://fundf10.eastmoney.com/',
      'Accept': '*/*',
    },
  });
  const text = await resp.text();
  return new Response(text, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
};
