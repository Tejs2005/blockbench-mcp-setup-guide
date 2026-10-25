const { Level } = require('level');
(async () => {
  const db = new Level('/tmp/bbls/leveldb', { valueEncoding: 'view' });
  for await (const [k, v] of db.iterator()) {
    const ks = k.toString().replace(/\x00/g, '');
    if (ks.includes('installed_plugins')) {
      let s = v.toString('latin1').replace(/[\x00-\x1f]/g, '');
      const start = s.indexOf('[{"id"');
      const end = s.lastIndexOf(']');
      const arr = JSON.parse(s.slice(start, end + 1));
      console.log('TOTAL:', arr.length);
      const mcp = arr.filter(p => /mcp/i.test(p.id) || p.source === 'file');
      console.log('MCP/file entries:', mcp.length ? mcp.map(p=>JSON.stringify(p)).join(' | ') : 'NONE');
    }
    let s2 = v.toString('latin1').replace(/[\x00-\x1f]/g, '');
    const a = s2.match(/"mcp_bridge_port":\{[^}]*\}/); const b = s2.match(/"blockbench_mcp_port":\{[^}]*\}/);
    if (a || b) console.log('PORT:', (a&&a[0]) || '', (b&&b[0]) || '');
  }
  await db.close();
})().catch(e => console.error('ERR', e.message.slice(0, 200)));
