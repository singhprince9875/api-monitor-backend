import React, { useState, useEffect, useMemo, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --surface: #111118; --surface2: #1a1a24;
    --border: #2a2a3a; --accent: #00ff88; --accent2: #ff3366;
    --accent3: #3d9eff; --text: #e8e8f0; --muted: #666680;
    --working: #00ff88; --down: #ff3366; --warn: #ffaa00;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; min-height: 100vh; }
  .app { min-height: 100vh; position: relative; overflow-x: hidden; }
  .app::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .wrap { position: relative; z-index: 1; max-width: 1300px; margin: 0 auto; padding: 40px 24px; }
  .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 48px; flex-wrap: wrap; gap: 16px; }
  .eyebrow { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--accent); }
  .title { font-size: clamp(28px, 4vw, 48px); font-weight: 800; line-height: 1; letter-spacing: -1px; }
  .title span { color: var(--accent); }
  .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
  .live-badge { display: flex; align-items: center; gap: 8px; background: rgba(0,255,136,0.08); border: 1px solid rgba(0,255,136,0.2); border-radius: 100px; padding: 8px 16px; font-family: 'Space Mono', monospace; font-size: 12px; color: var(--accent); }
  .live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
  .last-checked { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--muted); }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .tabs { display: flex; gap: 4px; margin-bottom: 32px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 4px; width: fit-content; animation: fadeUp 0.4s ease both; }
  .tab { font-family: 'Space Mono', monospace; font-size: 12px; padding: 8px 20px; border-radius: 8px; border: none; background: transparent; color: var(--muted); cursor: pointer; letter-spacing: 1px; transition: all 0.2s; }
  .tab.active { background: var(--accent); color: #000; font-weight: 700; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  @media(max-width:700px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px 24px; position: relative; overflow: hidden; animation: fadeUp 0.5s ease both; }
  .stat-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .stat-card:nth-child(1)::after{background:var(--accent3)}
  .stat-card:nth-child(2)::after{background:var(--working)}
  .stat-card:nth-child(3)::after{background:var(--down)}
  .stat-card:nth-child(4)::after{background:var(--warn)}
  .stat-label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .stat-value { font-size: 40px; font-weight: 800; line-height: 1; letter-spacing: -2px; }
  .stat-card:nth-child(1) .stat-value{color:var(--text)}
  .stat-card:nth-child(2) .stat-value{color:var(--working)}
  .stat-card:nth-child(3) .stat-value{color:var(--down)}
  .stat-card:nth-child(4) .stat-value{color:var(--warn)}
  .uptime-bar-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px 24px; margin-bottom: 32px; animation: fadeUp 0.5s 0.15s ease both; }
  .uptime-label { display: flex; justify-content: space-between; font-family: 'Space Mono', monospace; font-size: 12px; color: var(--muted); margin-bottom: 10px; }
  .uptime-bar { height: 8px; background: rgba(255,51,102,0.15); border-radius: 100px; overflow: hidden; }
  .uptime-fill { height: 100%; background: linear-gradient(90deg, var(--working), #00ccaa); border-radius: 100px; transition: width 1s ease; }
  .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
  @media(max-width:800px){.charts-row{grid-template-columns:1fr}}
  .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; animation: fadeUp 0.5s 0.2s ease both; }
  .chart-title { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 20px; }
  .donut-wrap { display: flex; align-items: center; gap: 24px; }
  .donut-svg { flex-shrink: 0; }
  .donut-legend { display: flex; flex-direction: column; gap: 12px; }
  .legend-item { display: flex; align-items: center; gap: 10px; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .legend-label { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--muted); }
  .legend-val { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; color: var(--text); }
  .toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; animation: fadeUp 0.5s 0.3s ease both; }
  .search-box { flex: 1; min-width: 200px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 16px; font-family: 'Space Mono', monospace; font-size: 13px; color: var(--text); outline: none; transition: border-color 0.2s; }
  .search-box:focus { border-color: var(--accent); }
  .search-box::placeholder { color: var(--muted); }
  .filter-btns { display: flex; gap: 6px; }
  .filter-btn { font-family: 'Space Mono', monospace; font-size: 11px; padding: 10px 16px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--muted); cursor: pointer; transition: all 0.2s; letter-spacing: 1px; }
  .filter-btn:hover{border-color:var(--accent);color:var(--accent)}
  .filter-btn.active{background:var(--accent);border-color:var(--accent);color:#000;font-weight:700}
  .filter-btn.active-down{background:var(--down);border-color:var(--down);color:#fff;font-weight:700}
  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; animation: fadeUp 0.5s 0.35s ease both; }
  .table-head { display: grid; grid-template-columns: 2fr 100px 130px 90px; padding: 12px 24px; background: var(--surface2); border-bottom: 1px solid var(--border); }
  .th { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }
  .table-row { display: grid; grid-template-columns: 2fr 100px 130px 90px; padding: 13px 24px; border-bottom: 1px solid var(--border); align-items: center; transition: background 0.15s; }
  .table-row:last-child{border-bottom:none}
  .table-row:hover{background:var(--surface2)}
  .api-url { font-family: 'Space Mono', monospace; font-size: 12px; color: var(--accent3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 12px; }
  .badge { display: inline-flex; align-items: center; gap: 5px; font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 3px 10px; border-radius: 100px; }
  .badge.working{background:rgba(0,255,136,0.1);color:var(--working);border:1px solid rgba(0,255,136,0.2)}
  .badge.down{background:rgba(255,51,102,0.1);color:var(--down);border:1px solid rgba(255,51,102,0.2)}
  .badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
  .working .badge-dot{animation:pulse 2s infinite}
  .rt { font-family: 'Space Mono', monospace; font-size: 12px; }
  .rt.fast{color:var(--working)} .rt.warn{color:var(--warn)} .rt.slow{color:var(--muted)} .rt.fail{color:var(--down)}
  .table-footer { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--muted); padding: 14px 24px; border-top: 1px solid var(--border); background: var(--surface2); }
  .history-grid { display: flex; flex-direction: column; gap: 12px; animation: fadeUp 0.4s ease both; }
  .history-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px 24px; }
  .history-url { font-family: 'Space Mono', monospace; font-size: 12px; color: var(--accent3); margin-bottom: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .history-meta { display: flex; gap: 20px; flex-wrap: wrap; }
  .history-stat { display: flex; flex-direction: column; gap: 2px; }
  .history-stat-label { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }
  .history-stat-val { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; }
  .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .loading-ring { width: 52px; height: 52px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  .loading-text { font-family: 'Space Mono', monospace; font-size: 12px; color: var(--muted); letter-spacing: 2px; }
  .chart-legend { display: flex; gap: 16px; margin-top: 12px; }
  .chart-legend-item { display: flex; align-items: center; gap: 6px; }
  .chart-legend-dot { width: 8px; height: 8px; border-radius: 2px; }
  .chart-legend-label { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--muted); }
`;

function rtClass(rt) {
  if (rt === "failed") return "fail";
  const ms = parseInt(rt);
  if (ms < 400) return "fast";
  if (ms < 800) return "warn";
  return "slow";
}

function rtColor(rt) {
  if (rt === "failed") return "#ff3366";
  const ms = parseInt(rt);
  if (ms < 400) return "#00ff88";
  if (ms < 800) return "#ffaa00";
  return "#666680";
}

// Pure SVG donut — zero dependencies
function DonutChart({ working, down }) {
  const total = working + down;
  const r = 60, cx = 70, cy = 70, stroke = 14;
  const circ = 2 * Math.PI * r;
  const workingDash = (working / total) * circ;
  return (
    <div className="donut-wrap">
      <svg width="140" height="140" className="donut-svg">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a3a" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ff3366" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={0} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#00ff88" strokeWidth={stroke}
          strokeDasharray={`${workingDash} ${circ - workingDash}`} strokeDashoffset={0}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#e8e8f0" fontSize="20" fontWeight="800" fontFamily="Syne">
          {Math.round((working / total) * 100)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#666680" fontSize="10" fontFamily="Space Mono">
          UPTIME
        </text>
      </svg>
      <div className="donut-legend">
        {[["#00ff88", working, "Working"], ["#ff3366", down, "Down"]].map(([color, val, label]) => (
          <div className="legend-item" key={label}>
            <div className="legend-dot" style={{ background: color }} />
            <div>
              <div className="legend-val">{val}</div>
              <div className="legend-label">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pure SVG bar chart — zero dependencies
function BarChartSVG({ data }) {
  if (!data.length) return null;
  const W = 600, H = 160, padL = 50, padB = 60, padR = 10, padT = 10;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxMs = Math.max(...data.map(d => d.ms), 1);
  const barW = Math.max(8, (chartW / data.length) - 3);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible" }}>
      {/* Y grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = padT + chartH - t * chartH;
        return (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#2a2a3a" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fill="#666680" fontSize="9" fontFamily="Space Mono">
              {Math.round(t * maxMs)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const x = padL + i * (chartW / data.length) + (chartW / data.length - barW) / 2;
        const barH = (d.ms / maxMs) * chartH;
        const y = padT + chartH - barH;
        const color = d.ms < 400 ? "#00ff88" : d.ms < 800 ? "#ffaa00" : "#666680";
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx="3" opacity="0.85" />
            <text
              x={x + barW / 2}
              y={H - padB + 14}
              textAnchor="end"
              fill="#666680"
              fontSize="8"
              fontFamily="Space Mono"
              transform={`rotate(-40, ${x + barW / 2}, ${H - padB + 14})`}
            >
              {d.name}
            </text>
          </g>
        );
      })}
      {/* Y axis label */}
      <text x={10} y={padT + chartH / 2} fill="#666680" fontSize="9" fontFamily="Space Mono"
        transform={`rotate(-90, 10, ${padT + chartH / 2})`} textAnchor="middle">ms</text>
    </svg>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [lastChecked, setLastChecked] = useState(null);

  const fetchData = () => {
    fetch("http://localhost:5000/api/status")
      .then(r => r.json())
      .then(json => { setData(json); setLastChecked(new Date()); })
      .catch(err => console.error("Fetch failed:", err));
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter(api => {
      const matchFilter = filter === "all" || api.status === filter;
      const matchSearch = api.url.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [data, filter, search]);

  const uniqueApis = useMemo(() => {
    if (!data?.results) return [];
    const seen = new Map();
    data.results.forEach(api => {
      if (!seen.has(api.url)) {
        seen.set(api.url, { ...api, checks: 1, totalMs: parseInt(api.responseTime) || 0 });
      } else {
        const e = seen.get(api.url);
        e.checks++;
        if (api.responseTime !== "failed") e.totalMs += parseInt(api.responseTime);
      }
    });
    return Array.from(seen.values());
  }, [data]);

  const chartData = useMemo(() => {
    if (!data?.results) return [];
    return data.results
      .filter(a => a.status === "working")
      .slice(0, 15)
      .map(a => ({
        name: a.url.replace("https://", "").split("/")[0].replace("www.", ""),
        ms: parseInt(a.responseTime),
      }));
  }, [data]);

  const avgMs = useMemo(() => {
    if (!data?.results) return 0;
    const working = data.results.filter(a => a.status === "working");
    const total = working.reduce((s, a) => s + parseInt(a.responseTime), 0);
    return working.length ? Math.round(total / working.length) : 0;
  }, [data]);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="wrap">

          {/* Header */}
          <div className="header">
            <div>
              <div className="eyebrow">System Dashboard</div>
              <h1 className="title">API <span>Monitor</span></h1>
            </div>
            <div className="header-right">
              <div className="live-badge"><div className="live-dot" />LIVE</div>
              {lastChecked && (
                <div className="last-checked">Last checked: {lastChecked.toLocaleTimeString()}</div>
              )}
            </div>
          </div>

          {!data && (
            <div className="loading">
              <div className="loading-ring" />
              <div className="loading-text">FETCHING API STATUS...</div>
            </div>
          )}

          {data && (
            <>
              {/* Tabs */}
              <div className="tabs">
                {["dashboard", "history"].map(t => (
                  <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              {tab === "dashboard" && (
                <>
                  {/* Stats */}
                  <div className="stats-grid">
                    {[
                      ["Total APIs", data.totalApis],
                      ["Working", data.working],
                      ["Down", data.down],
                      ["Avg Response", `${avgMs}ms`],
                    ].map(([label, val], i) => (
                      <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                        <div className="stat-label">{label}</div>
                        <div className="stat-value">{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Uptime bar */}
                  <div className="uptime-bar-wrap">
                    <div className="uptime-label">
                      <span>OVERALL UPTIME</span>
                      <span>{Math.round((data.working / data.totalApis) * 100)}%</span>
                    </div>
                    <div className="uptime-bar">
                      <div className="uptime-fill" style={{ width: `${(data.working / data.totalApis) * 100}%` }} />
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="charts-row">
                    <div className="chart-card">
                      <div className="chart-title">Status breakdown</div>
                      <DonutChart working={data.working} down={data.down} />
                    </div>
                    <div className="chart-card">
                      <div className="chart-title">Response times — top 15 working</div>
                      <BarChartSVG data={chartData} />
                      <div className="chart-legend">
                        {[["#00ff88", "< 400ms fast"], ["#ffaa00", "< 800ms medium"], ["#666680", "> 800ms slow"]].map(([c, l]) => (
                          <div className="chart-legend-item" key={l}>
                            <div className="chart-legend-dot" style={{ background: c }} />
                            <span className="chart-legend-label">{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Search + Filters */}
                  <div className="toolbar">
                    <input className="search-box" placeholder="Search API URL..." value={search}
                      onChange={e => setSearch(e.target.value)} />
                    <div className="filter-btns">
                      <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>ALL</button>
                      <button className={`filter-btn ${filter === "working" ? "active" : ""}`} onClick={() => setFilter("working")}>UP</button>
                      <button className={`filter-btn ${filter === "down" ? "active-down" : ""}`} onClick={() => setFilter("down")}>DOWN</button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="table-wrap">
                    <div className="table-head">
                      <div className="th">Endpoint</div>
                      <div className="th">Status</div>
                      <div className="th">Response Time</div>
                      <div className="th">Speed</div>
                    </div>
                    {filtered.map((api, i) => (
                      <div className="table-row" key={i}>
                        <div className="api-url">{api.url}</div>
                        <div>
                          <span className={`badge ${api.status}`}>
                            <span className="badge-dot" />
                            {api.status === "working" ? "UP" : "DOWN"}
                          </span>
                        </div>
                        <div className={`rt ${rtClass(api.responseTime)}`}>{api.responseTime}</div>
                        <div className={`rt ${rtClass(api.responseTime)}`}>
                          {api.responseTime === "failed" ? "—"
                            : parseInt(api.responseTime) < 400 ? "Fast"
                            : parseInt(api.responseTime) < 800 ? "Medium"
                            : "Slow"}
                        </div>
                      </div>
                    ))}
                    <div className="table-footer">
                      Showing {filtered.length} of {data.totalApis} endpoints
                      {search && ` · search: "${search}"`}
                    </div>
                  </div>
                </>
              )}

              {tab === "history" && (
                <div className="history-grid">
                  {uniqueApis.map((api, i) => (
                    <div className="history-card" key={i}>
                      <div className="history-url">{api.url}</div>
                      <div className="history-meta">
                        <div className="history-stat">
                          <div className="history-stat-label">Status</div>
                          <span className={`badge ${api.status}`} style={{ width: "fit-content" }}>
                            <span className="badge-dot" />
                            {api.status === "working" ? "UP" : "DOWN"}
                          </span>
                        </div>
                        <div className="history-stat">
                          <div className="history-stat-label">Last Response</div>
                          <div className="history-stat-val" style={{ color: rtColor(api.responseTime) }}>
                            {api.responseTime}
                          </div>
                        </div>
                        <div className="history-stat">
                          <div className="history-stat-label">Total Checks</div>
                          <div className="history-stat-val" style={{ color: "var(--accent3)" }}>
                            {api.checks}
                          </div>
                        </div>
                        <div className="history-stat">
                          <div className="history-stat-label">Avg Response</div>
                          <div className="history-stat-val" style={{ color: "var(--warn)" }}>
                            {api.checks > 1 && api.totalMs > 0 ? Math.round(api.totalMs / api.checks) + "ms" : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}