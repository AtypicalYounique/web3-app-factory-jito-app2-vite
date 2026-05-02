import React, { useMemo, useState, useRef } from "react";
import "./styles.css";

const TITLE = "JitoSOL Validator Set & NCN Operator Reliability Planner";
const SUB = "An internal-style scratchpad for protocol, validator-ops, and NCN-operator-facing teams to think through validator-set concentration, skip-rate distribution, region/peer diversity, and NCN operator readiness across the JitoSOL stake pool and Jito Restaking surface area. Inspired by publicly described Jito components — JitoSOL (~160 validators), StakeNet, Block Engine, Bundles, Jito Restaking, and TipRouter.";

function App() {
  const [validators, setValidators] = useState(160);    // total operators in pool
  const [topDeciles, setTopDeciles] = useState(35);     // % of stake held by top decile
  const [skipMedian, setSkipMedian] = useState(2.5);    // median skip rate %
  const [skipP90, setSkipP90] = useState(6);            // p90 skip rate %
  const [regions, setRegions] = useState(4);            // unique regions
  const [hardwareUniformity, setHardwareUniformity] = useState("Mixed (some operators on dedicated, some cloud)");
  const [monitoring, setMonitoring] = useState("Operator self-reported");
  const [ncns, setNcns] = useState(3);                  // NCNs to track
  const [ncnSlashable, setNcnSlashable] = useState("Some have slashing-equivalent conditions");
  const [tipRouterAware, setTipRouterAware] = useState("Yes — modeled in operator economics");
  const [showResult, setShowResult] = useState(false);
  const [toast, setToast] = useState(false);
  const ref = useRef(null);

  const concentrationRisk = Math.min(100, Math.round(topDeciles * 1.4));
  const skipRisk = Math.min(100, Math.round((skipMedian * 6) + (skipP90 * 4)));
  const regionRisk = Math.max(0, Math.min(100, Math.round((6 - regions) * 18)));
  const hardwareRisk =
    hardwareUniformity === "Mostly dedicated, single hardware tier" ? 12 :
    hardwareUniformity === "Mixed (some operators on dedicated, some cloud)" ? 38 :
    hardwareUniformity === "Mostly cloud / mixed unknown" ? 65 : 50;
  const monitoringRisk =
    monitoring === "Centralized real-time telemetry from all operators" ? 12 :
    monitoring === "Centralized real-time telemetry from most" ? 28 :
    monitoring === "Operator self-reported" ? 55 :
    monitoring === "No standardized reporting" ? 80 : 50;
  const ncnRisk = Math.min(100, Math.round(ncns * 8 + (ncnSlashable === "Yes — most have slashing-equivalent conditions" ? 30 : ncnSlashable === "Some have slashing-equivalent conditions" ? 18 : 6)));
  const overall = Math.round((concentrationRisk*1.0 + skipRisk*1.2 + regionRisk*0.9 + hardwareRisk*0.9 + monitoringRisk*1.0 + ncnRisk*0.8) / 5.8);

  const press = useMemo(() => {
    const out = [];
    if (topDeciles >= 35) out.push("Top-decile stake concentration is a meaningful single-failure-mode signal — even small operator incidents in that decile move the pool average noticeably.");
    if (skipP90 >= 6) out.push("Skip-rate p90 above ~6% means the long tail of operators is dragging the pool's effective performance — usually a hardware or peering issue concentrated in a few operators.");
    if (skipMedian >= 3) out.push("Median skip rate above ~3% across the set suggests systemic, not just tail, performance pressure.");
    if (regions <= 3) out.push("Three or fewer regions across 100+ operators is a quiet correlated-failure risk — region-level network or DDoS events can hit multiple operators at once.");
    if (hardwareRisk >= 50) out.push("Hardware heterogeneity inside a stake pool produces irreducible performance variance. Standardizing minimum NVMe/CPU specs across operators usually compresses skip-rate distribution.");
    if (monitoringRisk >= 50) out.push("If monitoring is mostly self-reported or non-standard, you don't see incidents until the public leaderboards do. A central telemetry feed shortens MTTR materially.");
    if (ncns >= 4 && ncnSlashable !== "None today") out.push("Layering ≥4 NCNs onto operator economics multiplies the surface area for slashing-equivalent events and operator coordination overhead — worth a per-NCN risk register.");
    if (tipRouterAware === "No / unclear") out.push("TipRouter changes operator economics in non-trivial ways (3% fee, 0.15% to vault operators per public docs). Operators not modeling it are likely undercounting their effective revenue and risk.");
    return out.slice(0, 7);
  }, [topDeciles, skipMedian, skipP90, regions, hardwareRisk, monitoringRisk, ncns, ncnSlashable, tipRouterAware]);

  const measureNext = [
    "Skip-rate distribution across the operator set, weighted by stake (not just unweighted average).",
    "Per-operator vote credit and leader-window performance, with stake-weighted aggregation.",
    "Region and ASN map of the operator set; flag any region/ASN holding > 25% of stake.",
    "Per-NCN operator overlap with the JitoSOL validator set (correlated failure risk).",
    "Hardware spec floor enforcement (NVMe IOPS, single-thread CPU benchmark) at operator onboarding.",
  ];
  const askInternal = [
    "If the worst-skip operator entered prolonged degradation tomorrow, what's the stake-weighted impact on JitoSOL APY?",
    "Which operators in the set host more than one NCN, and what's the correlated risk?",
    "Are operators reporting telemetry on a standardized cadence, or only on incident?",
    "What's our process for off-boarding under-performing operators without disrupting LST holders?",
    "How is TipRouter fee distribution being verified end-to-end?",
  ];
  const askProvider = [
    "What is your single-thread CPU and NVMe IOPS profile for Solana validator workloads?",
    "Do you offer DDoS protection sized for Solana validator endpoints, including private network paths?",
    "What is your snapshot restore time at p50/p95 for a fully synced Solana mainnet validator?",
    "Can you give consistent hardware tiers across multiple regions for a multi-operator deployment?",
    "What's your story for noisy-neighbor isolation — is this dedicated, or shared?",
  ];

  const brief = useMemo(() => {
    const lines = [];
    lines.push(TITLE);
    lines.push(`Overall risk index: ${overall} / 100 (composite, lower is better)`);
    lines.push(`Concentration risk: ${concentrationRisk}`);
    lines.push(`Skip-rate distribution risk: ${skipRisk}`);
    lines.push(`Region risk: ${regionRisk}`);
    lines.push(`Hardware heterogeneity risk: ${hardwareRisk}`);
    lines.push(`Monitoring maturity risk: ${monitoringRisk}`);
    lines.push(`NCN surface-area risk: ${ncnRisk}`);
    lines.push("");
    lines.push("Inputs:");
    lines.push(`  • Operators in pool: ${validators}`);
    lines.push(`  • % stake in top decile: ${topDeciles}%`);
    lines.push(`  • Skip-rate median / p90: ${skipMedian}% / ${skipP90}%`);
    lines.push(`  • Unique regions: ${regions}`);
    lines.push(`  • Hardware uniformity: ${hardwareUniformity}`);
    lines.push(`  • Monitoring: ${monitoring}`);
    lines.push(`  • NCNs being run: ${ncns}`);
    lines.push(`  • NCNs with slashing-equivalent conditions: ${ncnSlashable}`);
    lines.push(`  • TipRouter awareness in operator economics: ${tipRouterAware}`);
    lines.push("");
    lines.push("Likely pressure points:");
    press.forEach(p => lines.push(`  - ${p}`));
    lines.push("");
    lines.push("What to measure next:");
    measureNext.forEach(p => lines.push(`  - ${p}`));
    lines.push("");
    lines.push("Questions to ask internally:");
    askInternal.forEach(p => lines.push(`  - ${p}`));
    lines.push("");
    lines.push("Questions to ask an infra provider for operators:");
    askProvider.forEach(p => lines.push(`  - ${p}`));
    lines.push("");
    lines.push("Disclaimer: pattern-based scratchpad. Numbers are illustrative; not a measurement of the live JitoSOL set.");
    return lines.join("\n");
  }, [validators, topDeciles, skipMedian, skipP90, regions, hardwareUniformity, monitoring, ncns, ncnSlashable, tipRouterAware, overall, concentrationRisk, skipRisk, regionRisk, hardwareRisk, monitoringRisk, ncnRisk, press]);

  const onCopy = async () => {
    try { await navigator.clipboard.writeText(brief); setToast(true); setTimeout(()=>setToast(false),1600); }
    catch { const ta=document.createElement("textarea"); ta.value=brief; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); setToast(true); setTimeout(()=>setToast(false),1600); }
  };
  const onGen = () => { setShowResult(true); setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };

  const Pills = ({ value, set, options }: { value: string; set: (v: string) => void; options: string[] }) => (
    <div className="pillgroup">
      {options.map(o => (
        <button key={o} className={"pill " + (value === o ? "active" : "")} onClick={() => set(o)} type="button">{o}</button>
      ))}
    </div>
  );

  const meterColor = (v) => v < 40 ? "#4ade80" : v < 70 ? "#ffb454" : "#ff6b6b";

  return (
    <div className="wrap">
      <div className="eyebrow">Internal scratchpad · Solana validator set + NCN operators · Pattern-based</div>
      <h1>{TITLE}</h1>
      <p className="lede">{SUB}</p>

      <div className="card">
        <div className="row">
          <div>
            <label>Operators in stake pool: <span className="num">{validators}</span></label>
            <input type="range" min="20" max="300" step="5" value={validators} onChange={e => setValidators(+e.target.value)} />
          </div>
          <div>
            <label>% stake in top decile: <span className="num">{topDeciles}%</span></label>
            <input type="range" min="10" max="80" step="1" value={topDeciles} onChange={e => setTopDeciles(+e.target.value)} />
          </div>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <div>
            <label>Skip-rate median (%) across operators: <span className="num">{skipMedian}%</span></label>
            <input type="range" min="0" max="10" step="0.1" value={skipMedian} onChange={e => setSkipMedian(+e.target.value)} />
          </div>
          <div>
            <label>Skip-rate p90 (%) across operators: <span className="num">{skipP90}%</span></label>
            <input type="range" min="0" max="20" step="0.1" value={skipP90} onChange={e => setSkipP90(+e.target.value)} />
          </div>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <div>
            <label>Unique regions across operator set: <span className="num">{regions}</span></label>
            <input type="range" min="1" max="8" value={regions} onChange={e => setRegions(+e.target.value)} />
          </div>
          <div>
            <label>NCNs being supported: <span className="num">{ncns}</span></label>
            <input type="range" min="0" max="10" value={ncns} onChange={e => setNcns(+e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label>Hardware uniformity</label>
          <Pills value={hardwareUniformity} set={setHardwareUniformity} options={["Mostly dedicated, single hardware tier","Mixed (some operators on dedicated, some cloud)","Mostly cloud / mixed unknown","Don't know"]} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Operator monitoring</label>
          <Pills value={monitoring} set={setMonitoring} options={["Centralized real-time telemetry from all operators","Centralized real-time telemetry from most","Operator self-reported","No standardized reporting"]} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>NCN slashing-equivalent conditions</label>
          <Pills value={ncnSlashable} set={setNcnSlashable} options={["None today","Some have slashing-equivalent conditions","Yes — most have slashing-equivalent conditions"]} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>TipRouter awareness in operator economics</label>
          <Pills value={tipRouterAware} set={setTipRouterAware} options={["Yes — modeled in operator economics","Partially","No / unclear"]} />
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn" onClick={onGen}>Generate planner brief</button>
        </div>
      </div>

      {showResult && (
        <div ref={ref}>
          <div className="row3">
            <div className="card tight">
              <div className="eyebrow">Overall risk index</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{overall}<span style={{ color: "var(--muted)", fontSize: 14, fontWeight: 500 }}> / 100</span></div>
              <div className="meter"><div style={{ width: overall + "%", background: meterColor(overall) }} /></div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>Composite, lower is better.</div>
            </div>
            <div className="card tight">
              <div className="eyebrow">Concentration risk</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{concentrationRisk}</div>
              <div className="meter"><div style={{ width: concentrationRisk + "%", background: meterColor(concentrationRisk) }} /></div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>Top-decile share of stake.</div>
            </div>
            <div className="card tight">
              <div className="eyebrow">Skip-rate distribution risk</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{skipRisk}</div>
              <div className="meter"><div style={{ width: skipRisk + "%", background: meterColor(skipRisk) }} /></div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>Median + tail combined.</div>
            </div>
          </div>

          <div className="row3">
            <div className="card tight">
              <div className="eyebrow">Region risk</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{regionRisk}</div>
              <div className="meter"><div style={{ width: regionRisk + "%", background: meterColor(regionRisk) }} /></div>
            </div>
            <div className="card tight">
              <div className="eyebrow">Hardware heterogeneity risk</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{hardwareRisk}</div>
              <div className="meter"><div style={{ width: hardwareRisk + "%", background: meterColor(hardwareRisk) }} /></div>
            </div>
            <div className="card tight">
              <div className="eyebrow">Monitoring maturity risk</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{monitoringRisk}</div>
              <div className="meter"><div style={{ width: monitoringRisk + "%", background: meterColor(monitoringRisk) }} /></div>
            </div>
          </div>

          <div className="card">
            <h2>Likely pressure points</h2>
            <ul className="ticks">
              {press.length === 0 && <li>No major patterns flagged based on inputs. Healthy starting point — keep watching the long tail.</li>}
              {press.map((p,i) => <li key={i}>{p}</li>)}
            </ul>
          </div>

          <div className="row">
            <div className="card tight">
              <h2>What to measure next</h2>
              <ul className="ticks">{measureNext.map((p,i) => <li key={i}>{p}</li>)}</ul>
            </div>
            <div className="card tight">
              <h2>Questions to ask internally</h2>
              <ul className="ticks">{askInternal.map((p,i) => <li key={i}>{p}</li>)}</ul>
            </div>
          </div>

          <div className="card">
            <h2>Questions to ask an infra provider for operators</h2>
            <ul className="ticks">{askProvider.map((p,i) => <li key={i}>{p}</li>)}</ul>
          </div>

          <div className="card">
            <h2>What this does not prove</h2>
            <div style={{ color: "#cdd3df", fontSize: 14, lineHeight: 1.6 }}>
              This planner is a directional frame. It does not measure live JitoSOL operator data, real per-operator skip rates, NCN slashing events, or TipRouter distribution. Use it for shared vocabulary and risk-mapping, not as a measurement of the actual set.
            </div>
          </div>

          <div className="card">
            <h2>Where dedicated infrastructure may be worth comparing</h2>
            <div style={{ color: "#cdd3df", fontSize: 14, lineHeight: 1.6 }}>
              Solana validator performance — single-thread CPU, NVMe IOPS, network quality, DDoS posture — is one of the few operational areas where hardware differences show up directly in public skip-rate and revenue signals. For operators in a high-visibility stake pool, dedicated bare metal with predictable hardware tiers is generally worth comparing to current cloud setups. Not a sales claim about any specific provider, just a comparison worth running on real numbers.
            </div>
          </div>

          <div className="card">
            <button className="btn" onClick={onCopy}>Copy planner brief</button>
          </div>
        </div>
      )}

      <div className="footer-note">
        Pattern-based scratchpad inspired by publicly described Jito components: JitoSOL stake pool (~160 validators), StakeNet on-chain delegation framework, Block Engine + Bundles, and Jito Restaking with NCNs and TipRouter. No data leaves your browser; numbers are illustrative.
      </div>

      <div className={"toast " + (toast ? "show" : "")}>Brief copied to clipboard</div>
    </div>
  );
}

export default App;
