const { Level } = require('level');
(async () => {
  const dbPath = process.env.HOME + '/.var/app/net.blockbench.Blockbench/config/Blockbench/Local Storage/leveldb';
  const db = new Level(dbPath, { valueEncoding: 'view' });
  let targetKey = null;
  for await (const k of db.keys()) {
    const ks = k.toString('latin1').replace(/\x00/g, '');
    if (ks.includes('StateMemory.installed_plugins')) { targetKey = k; break; }
  }
  if (!targetKey) { console.error('KEY NOT FOUND'); process.exit(1); }
  const val = await db.get(targetKey);
  const raw = Buffer.from(val);
  const start = raw.indexOf('[');
  const prefix = raw.slice(0, start);
  const json = raw.slice(start).toString('latin1').replace(/[\x00-\x1f]/g, '');
  const arr = JSON.parse(json);
  const before = JSON.stringify(arr.find(p => p.id === 'blockbench_mcp') || null);
  const idx = arr.findIndex(p => p.id === 'blockbench_mcp');
  const entry = { id: 'blockbench_mcp', version: '1.9.0.1', path: '/home/linux/Desktop/blockbench_mcp.js', source: 'file' };
  if (idx >= 0) arr[idx] = entry; else arr.push(entry);
  const out = Buffer.concat([prefix, Buffer.from(JSON.stringify(arr), 'latin1')]);
  await db.put(targetKey, out);
  console.log('BEFORE:', before);
  console.log('AFTER: ', JSON.stringify(entry));
  await db.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
