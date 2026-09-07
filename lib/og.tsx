import type { Nutrition } from "@/lib/nutrition";
import { n } from "@/lib/nutrition";
import { cardPosition, cardRating, cardStats } from "@/lib/card";
import { FONT } from "@/lib/og-fonts";

/* OG images render through Satori, which supports a subset of CSS: inline
 * styles only, flexbox only, no grid, no class names. So this is a hand-built
 * echo of the panel rather than a reuse of NutritionLabel — same typography
 * decisions, different renderer. */

export const OG_SIZE = { width: 1200, height: 630 };

const mono = FONT.mono;

function Rule({ h, mt = 0 }: { h: number; mt?: number }) {
  return <div style={{ display: "flex", height: h, background: "#000", marginTop: mt }} />;
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        borderBottom: "1px solid rgba(0,0,0,0.15)",
        padding: "5px 0",
        fontSize: 21,
      }}
    >
      <span style={{ fontFamily: FONT.bold }}>{label}</span>
      <span style={{ fontFamily: mono }}>{value}</span>
    </div>
  );
}

/* The developer panel: a landscape crop of the label, since 1200×630 is a
 * wide frame and the portrait panel would leave two dead columns. */
export function OgPanel({ d }: { d: Nutrition }) {
  const stats = cardStats(d);
  const detail = [d.name !== d.login ? d.name : null, d.company, d.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#fff",
        color: "#000",
        padding: 44,
        fontFamily: FONT.body,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {d.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.avatar}
              width={54}
              height={54}
              style={{ borderRadius: 999, border: "1px solid rgba(0,0,0,0.15)" }}
              alt=""
            />
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: mono, fontSize: 19, letterSpacing: 2, color: "#555" }}>
              @{d.login.toUpperCase()} · {d.years} YRS CULTURED
            </span>
            {detail && (
              <span style={{ fontSize: 18, color: "#777", marginTop: 2 }}>{detail}</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 82, fontFamily: FONT.black, letterSpacing: -2, marginTop: 10 }}>
          Nutrition Facts
        </div>
        <Rule h={12} mt={6} />

        <div style={{ display: "flex", fontSize: 21, padding: "7px 0", borderBottom: "1px solid rgba(0,0,0,0.15)" }}>
          {n(d.servings)} servings per lifetime
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 21,
            fontFamily: FONT.bold,
            padding: "7px 0",
          }}
        >
          <span>Serving size</span>
          <span>1 Pull Request (~400 LOC)</span>
        </div>
        <Rule h={9} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 6,
          }}
        >
          <span style={{ fontSize: 44, fontFamily: FONT.black, letterSpacing: -1 }}>Calories</span>
          <span style={{ fontFamily: mono, fontSize: 58 }}>{n(d.calories)}</span>
        </div>
        <Rule h={6} mt={2} />

        <StatLine label="Total Caffeine" value={`${n(d.caffeine)}mg`} />
        <StatLine label="Saturated Tech Debt" value={`${n(d.debt)}%`} />
        <StatLine label="Documentation" value={`${d.docs}%`} />
        <StatLine label="Raw Aura / Clout" value={`${d.aura}%`} />

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontFamily: mono,
            fontSize: 15,
            letterSpacing: 2,
            color: "#999",
          }}
        >
          DEVNUTRITION · {d.real ? "VERIFIED VIA API.GITHUB.COM" : "SIMULATED"} · FDA CERTIFIED
        </div>
      </div>

      {/* right rail: the grade stamp and the scouting numbers */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 268,
          borderLeft: "3px solid #000",
          paddingLeft: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 160,
            height: 160,
            borderRadius: 999,
            border: "6px solid #000",
          }}
        >
          <span style={{ fontSize: 76, fontFamily: FONT.black, letterSpacing: -3, lineHeight: 1 }}>
            {d.grade}
          </span>
          <span style={{ fontFamily: mono, fontSize: 13, letterSpacing: 4, marginTop: 2 }}>
            F.D.A.
          </span>
        </div>

        <span style={{ display: "flex", fontFamily: mono, fontSize: 16, letterSpacing: 3, color: "#666", marginTop: 18 }}>
          {cardPosition(d)}
        </span>
        <span style={{ display: "flex", fontFamily: mono, fontSize: 72, lineHeight: 1 }}>
          {cardRating(d)}
        </span>
        <span style={{ display: "flex", fontSize: 15, color: "#777", marginBottom: 14 }}>
          OVERALL RATING
        </span>

        <div style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: 0 }}>
          {stats.map((st) => (
            <div
              key={st.key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "50%",
                fontFamily: mono,
                fontSize: 18,
                padding: "4px 8px 4px 0",
                borderBottom: "1px solid rgba(0,0,0,0.15)",
              }}
            >
              <span style={{ fontFamily: FONT.bold }}>{st.key}</span>
              <span>{String(st.value).padStart(2, "0")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* The brand frame, used where there is no specific developer to show. */
export function OgCover({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#0d0d0f",
        color: "#fff",
        padding: 76,
        fontFamily: FONT.body,
      }}
    >
      <span style={{ fontFamily: mono, fontSize: 22, letterSpacing: 8, color: "#8a8a93" }}>
        FEDERAL DEV ADMINISTRATION
      </span>
      <span style={{ fontSize: 104, fontFamily: FONT.black, letterSpacing: -4, marginTop: 14 }}>
        {title}
      </span>
      <span style={{ fontSize: 34, color: "#b8b8c0", marginTop: 14, lineHeight: 1.35 }}>
        {subtitle}
      </span>
      <div style={{ display: "flex", gap: 12, marginTop: 34 }}>
        {["CAFFEINE", "TECH DEBT", "DOCUMENTATION", "RAW AURA"].map((t) => (
          <span
            key={t}
            style={{
              display: "flex",
              fontFamily: mono,
              fontSize: 19,
              letterSpacing: 2,
              color: "#d8d8de",
              border: "1px solid #33333a",
              borderRadius: 999,
              padding: "9px 18px",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
