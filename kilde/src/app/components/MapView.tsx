import { useState, useCallback } from 'react';
import { UNIVERSITY_INFO } from '../data/courseMapping';
import { STUDIEBAROMETER_DATA } from '../data/studiebarometerData';
import { ADMISSION_DATA } from '../data/admissionData';

const SVG_W = 460;
const SVG_H = 740;
const MIN_LNG = 4.0;
const MAX_LNG = 32.0;
const MIN_LAT = 57.4;
const MAX_LAT = 72.4;

function project(lng: number, lat: number): [number, number] {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * SVG_W;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * SVG_H;
  return [x, y];
}

// Norway outline [lng, lat]
const OUTLINE: [number, number][] = [
  [7.05, 57.98],[6.80, 58.10],[6.48, 58.30],[5.98, 58.45],[5.73, 58.89],
  [5.58, 59.12],[5.27, 59.42],[5.52, 59.77],[5.32, 60.10],[5.05, 60.28],
  [5.28, 60.40],[4.97, 60.63],[4.82, 61.05],[4.88, 61.35],[5.05, 61.60],
  [4.85, 62.12],[5.62, 62.28],[6.15, 62.47],[7.12, 62.76],[7.73, 63.11],
  [8.52, 63.50],[9.22, 63.72],[9.52, 63.76],[10.02, 63.60],[10.42, 63.43],
  [10.87, 63.72],[11.22, 64.07],[11.52, 64.52],[12.22, 65.48],[12.63, 66.02],
  [12.87, 66.42],[13.32, 66.87],[14.15, 67.28],[14.82, 67.82],[15.72, 68.12],
  [16.57, 68.47],[17.42, 68.43],[17.22, 68.77],[18.02, 69.22],[18.96, 69.65],
  [19.62, 70.02],[20.52, 70.32],[21.62, 70.62],[22.57, 70.82],[23.68, 70.67],
  [24.57, 71.17],[25.78, 71.11],[27.12, 71.07],[28.02, 70.77],[29.22, 70.37],
  [30.62, 70.42],[30.05, 69.73],[29.00, 69.65],[28.90, 69.10],[27.82, 69.07],
  [26.80, 69.20],[25.02, 69.07],[23.72, 68.98],[22.45, 68.85],[21.00, 68.78],
  [20.55, 69.06],[18.50, 68.44],[17.80, 68.00],[16.50, 67.50],[15.40, 67.00],
  [14.60, 66.00],[14.00, 65.00],[13.50, 64.00],[12.90, 63.00],[12.20, 62.00],
  [12.40, 61.00],[12.62, 60.07],[12.28, 59.62],[11.80, 59.32],[11.30, 59.10],
  [10.93, 59.22],[10.62, 59.24],[10.26, 59.13],[10.06, 59.09],[9.67, 59.14],
  [9.41, 58.87],[9.22, 58.72],[8.77, 58.46],[7.99, 58.15],[7.46, 58.03],
  [7.05, 57.98],
];

function buildPath(): string {
  return OUTLINE.map(([lng, lat], i) => {
    const [x, y] = project(lng, lat);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ') + ' Z';
}
const NORWAY_PATH = buildPath();

interface MapPoint {
  universityId: string;
  campusLabel: string;
  shortLabel: string;
  lng: number;
  lat: number;
}

const MAP_POINTS: MapPoint[] = [
  { universityId:'nhh',           campusLabel:'NHH – Bergen',                shortLabel:'NHH',            lng:5.281,  lat:60.394 },
  { universityId:'hvl',           campusLabel:'HVL – Bergen',                shortLabel:'HVL',            lng:5.348,  lat:60.371 },
  { universityId:'hvl',           campusLabel:'HVL – Haugesund',             shortLabel:'HVL',            lng:5.268,  lat:59.413 },
  { universityId:'hvl',           campusLabel:'HVL – Sogndal',               shortLabel:'HVL',            lng:7.101,  lat:61.230 },
  { universityId:'nmbu',          campusLabel:'NMBU – Ås',                   shortLabel:'NMBU',           lng:10.773, lat:59.664 },
  { universityId:'uia',           campusLabel:'UiA – Kristiansand',          shortLabel:'UiA',            lng:8.004,  lat:58.157 },
  { universityId:'nla',           campusLabel:'NLA – Kristiansand',          shortLabel:'NLA',            lng:8.020,  lat:58.162 },
  { universityId:'usn',           campusLabel:'USN – Drammen',               shortLabel:'USN',            lng:10.204, lat:59.744 },
  { universityId:'usn_bo',        campusLabel:'USN – Bø',                    shortLabel:'USN Bø',         lng:9.065,  lat:59.420 },
  { universityId:'usn_kongsberg', campusLabel:'USN – Kongsberg',             shortLabel:'USN Kongsberg',  lng:9.650,  lat:59.643 },
  { universityId:'usn_honefoss',  campusLabel:'USN – Hønefoss',              shortLabel:'USN Hønefoss',   lng:10.254, lat:60.175 },
  { universityId:'hio',           campusLabel:'HiØ – Halden',                shortLabel:'HiØ',            lng:11.380, lat:59.130 },
  { universityId:'bi',            campusLabel:'BI Handelshøyskolen',         shortLabel:'BI',             lng:10.712, lat:59.932 },
  { universityId:'kristiania',    campusLabel:'Høyskolen Kristiania – Oslo', shortLabel:'Kristiania',     lng:10.729, lat:59.924 },
  { universityId:'oslomet',       campusLabel:'OsloMet – Oslo',              shortLabel:'OsloMet',        lng:10.743, lat:59.918 },
  { universityId:'onh',           campusLabel:'ONH – Oslo',                  shortLabel:'ONH',            lng:10.753, lat:59.911 },
  { universityId:'nla',           campusLabel:'NLA – Oslo',                  shortLabel:'NLA',            lng:10.760, lat:59.913 },
  { universityId:'ntnu',          campusLabel:'NTNU – Trondheim',            shortLabel:'NTNU',           lng:10.405, lat:63.418 },
  { universityId:'ntnu_gjovik',   campusLabel:'NTNU – Gjøvik',               shortLabel:'NTNU Gjøvik',    lng:10.691, lat:60.793 },
  { universityId:'ntnu_alesund',  campusLabel:'NTNU – Ålesund',              shortLabel:'NTNU Ålesund',   lng:6.151,  lat:62.471 },
  { universityId:'uit',           campusLabel:'UiT – Tromsø',                shortLabel:'UiT',            lng:18.956, lat:69.649 },
  { universityId:'uis',           campusLabel:'UiS – Stavanger',             shortLabel:'UiS',            lng:5.713,  lat:58.889 },
  { universityId:'inn',           campusLabel:'INN – Lillehammer',           shortLabel:'INN',            lng:10.467, lat:61.118 },
  { universityId:'inn_rena',      campusLabel:'INN – Rena',                  shortLabel:'INN Rena',       lng:11.358, lat:61.060 },
  { universityId:'nord',          campusLabel:'Nord – Bodø',                 shortLabel:'Nord Bodø',      lng:14.375, lat:67.280 },
  { universityId:'nord',          campusLabel:'Nord – Steinkjer',            shortLabel:'Nord Steinkjer', lng:11.495, lat:64.015 },
  { universityId:'himolde',       campusLabel:'HiMolde – Molde',             shortLabel:'HiMolde',        lng:7.162,  lat:62.744 },
];

// Geographic offsets (lng, lat) to separate overlapping markers.
// 1 lng deg ≈ 16.4 SVG px · 1 lat deg ≈ 49.3 SVG px
// Dot radius = 9, so need ≥18 px between centers.
const CLUSTER_OFFSET: Record<string, [number, number]> = {
  // --- Oslo (5 institutions, pentagon) ---
  'BI Handelshøyskolen':          [  0.00,  0.55],  // top centre
  'Høyskolen Kristiania – Oslo':  [ -1.40,  0.20],  // upper-left
  'OsloMet – Oslo':               [  1.40,  0.20],  // upper-right
  'ONH – Oslo':                   [ -0.70, -0.40],  // lower-left
  'NLA – Oslo':                   [  0.70, -0.40],  // lower-right
  // --- Kristiansand (2 institutions, side by side) ---
  'UiA – Kristiansand':           [ -0.95,  0.00],
  'NLA – Kristiansand':           [  0.95,  0.00],
  // --- Bergen (2 institutions) ---
  'NHH – Bergen':                 [ -0.60,  0.12],
  'HVL – Bergen':                 [  0.60, -0.12],
};

// Per-campus label positioning relative to dot centre (SVG pixels).
// Default for unlisted: right of dot.
interface LabelCfg { dx: number; dy: number; anchor: string }
const DEFAULT_LABEL: LabelCfg = { dx: 13, dy: 4, anchor: 'start' };

const LABEL_CFG: Record<string, LabelCfg> = {
  // Oslo
  'BI Handelshøyskolen':          { dx:  0,   dy: -13, anchor: 'middle' },
  'Høyskolen Kristiania – Oslo':  { dx: -13,  dy:   4, anchor: 'end'    },
  'OsloMet – Oslo':               { dx:  13,  dy:   4, anchor: 'start'  },
  'ONH – Oslo':                   { dx: -13,  dy:   4, anchor: 'end'    },
  'NLA – Oslo':                   { dx:  13,  dy:   4, anchor: 'start'  },
  // Kristiansand
  'UiA – Kristiansand':           { dx: -13,  dy:   4, anchor: 'end'    },
  'NLA – Kristiansand':           { dx:  13,  dy:   4, anchor: 'start'  },
  // Bergen
  'NHH – Bergen':                 { dx: -13,  dy:   4, anchor: 'end'    },
  'HVL – Bergen':                 { dx:  13,  dy:   4, anchor: 'start'  },
  // West-coast labels → push left so they stay on land
  'HVL – Haugesund':              { dx: -13,  dy:   4, anchor: 'end'    },
  'UiS – Stavanger':              { dx: -13,  dy:   4, anchor: 'end'    },
  'NTNU – Ålesund':               { dx: -13,  dy:   4, anchor: 'end'    },
  'HiMolde – Molde':              { dx: -13,  dy:   4, anchor: 'end'    },
  'HVL – Sogndal':                { dx:  13,  dy:   4, anchor: 'start'  },
  // North
  'UiT – Tromsø':                 { dx:  13,  dy:   4, anchor: 'start'  },
  'Nord – Bodø':                  { dx:  13,  dy:   4, anchor: 'start'  },
  // East
  'INN – Rena':                   { dx:  13,  dy:   4, anchor: 'start'  },
};

const PRIVATE_IDS = new Set(['bi', 'kristiania', 'onh']);

function scoreColor(score: number | null, isPrivate: boolean): string {
  if (isPrivate || score === null) return '#9CA3AF';
  if (score >= 4.2) return '#025C4F';
  if (score >= 4.0) return '#2D8A65';
  if (score >= 3.8) return '#5BA67A';
  if (score >= 3.6) return '#F59E0B';
  return '#EF4444';
}

function fmtAdm(val: number | null, stipulated?: number): string {
  const v = stipulated !== undefined ? stipulated : val;
  if (v === null) return '–';
  if (v === 0) return 'Åpent opptak';
  return `${v.toFixed(1)}p`;
}

interface TooltipState {
  clientX: number; clientY: number;
  campusLabel: string;
  score: number | null;
  isPrivate: boolean;
  baroNote?: string;
  ordDisplay: string;
  ftDisplay: string | null;
  hasAdm: boolean;
}

function Tooltip({ t }: { t: TooltipState }) {
  return (
    <div
      className="fixed z-50 pointer-events-none rounded-xl"
      style={{
        left: t.clientX + 14, top: t.clientY - 10,
        width: 230, background: 'white',
        border: '1px solid var(--nmbu-neutral-3)',
        boxShadow: '0 4px 20px rgba(2,92,79,0.15)',
        padding: '10px 13px',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, color: '#025C4F', borderBottom: '1px solid #e6e6e6', paddingBottom: 7, marginBottom: 8 }}>
        {t.campusLabel}
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
          Helhetsvurdering 2025
        </div>
        {t.score !== null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: scoreColor(t.score, false), color: 'white', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.score.toFixed(1)}
            </div>
            <span style={{ fontSize: 12, color: '#374151' }}>av 5,0</span>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            {t.isPrivate ? 'Privat – ikke inkludert' : t.baroNote ? 'For få respondenter' : 'Ikke tilgjengelig'}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
          Opptaksgrenser 2025
        </div>
        {t.hasAdm ? (
          <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
            <div>Ordinær:&ensp;<strong>{t.ordDisplay}</strong></div>
            {t.ftDisplay && <div>Førsteg.:&ensp;<strong>{t.ftDisplay}</strong></div>}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Eget opptakssystem</span>
        )}
      </div>
    </div>
  );
}

const DOT_R = 9;

export function MapView() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleEnter = useCallback((e: React.MouseEvent, point: MapPoint) => {
    const baroEntry = STUDIEBAROMETER_DATA.find(d => d.campus === point.campusLabel);
    const score = baroEntry?.scores.helhetsvurdering ?? null;
    const isPrivate = PRIVATE_IDS.has(point.universityId);
    const admId = point.universityId.startsWith('usn_') ? 'usn' : point.universityId;
    const admEntry = ADMISSION_DATA.find(d => d.universityId === admId);
    const adm2025 = admEntry?.years['2025'];
    const stipulated = admEntry?.stipulatedOrdinary;
    setTooltip({
      clientX: e.clientX, clientY: e.clientY,
      campusLabel: point.campusLabel, score, isPrivate,
      baroNote: baroEntry?.note,
      ordDisplay: adm2025 ? fmtAdm(adm2025.ordinary, stipulated) : '–',
      ftDisplay: adm2025?.firstTimers && adm2025.firstTimers !== 0 ? `${adm2025.firstTimers.toFixed(1)}p` : null,
      hasAdm: !!admEntry,
    });
  }, []);

  const handleLeave = useCallback(() => setTooltip(null), []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-2xl mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Kart</h2>
            <p className="text-sm" style={{ color: 'var(--nmbu-neutral-1)' }}>
              Geografisk oversikt over BØA-studiesteder. Hold musepekeren over en markør for studiebarometer-score og opptaksgrenser.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs items-center" style={{ color: 'var(--nmbu-neutral-1)' }}>
            {[
              { color: '#025C4F', label: '≥ 4,2' },
              { color: '#2D8A65', label: '4,0–4,2' },
              { color: '#5BA67A', label: '3,8–4,0' },
              { color: '#F59E0B', label: '3,6–3,8' },
              { color: '#EF4444', label: '< 3,6' },
              { color: '#9CA3AF', label: 'Ingen data' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }} />
                <span>{label}</span>
              </div>
            ))}
            <span style={{ color: 'var(--nmbu-neutral-2)', marginLeft: 4 }}>Helhetsvurdering 2025</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: 'block', width: '100%', maxHeight: '80vh', background: '#E8F3F8' }}
          onMouseLeave={handleLeave}
        >
          <path d={NORWAY_PATH} fill="#F0EDE4" stroke="#C8C4B8" strokeWidth="1.2" strokeLinejoin="round" />

          {MAP_POINTS.map((point) => {
            const offset = CLUSTER_OFFSET[point.campusLabel] ?? [0, 0];
            const [x, y] = project(point.lng + offset[0], point.lat + offset[1]);
            const baroEntry = STUDIEBAROMETER_DATA.find(d => d.campus === point.campusLabel);
            const score = baroEntry?.scores.helhetsvurdering ?? null;
            const isPrivate = PRIVATE_IDS.has(point.universityId);
            const color = scoreColor(score, isPrivate);
            const lbl = LABEL_CFG[point.campusLabel] ?? DEFAULT_LABEL;

            return (
              <g
                key={`${point.universityId}-${point.campusLabel}`}
                onMouseEnter={(e) => handleEnter(e, point)}
                style={{ cursor: 'pointer' }}
              >
                {/* Drop shadow */}
                <circle cx={x + 0.5} cy={y + 1.5} r={DOT_R} fill="rgba(0,0,0,0.14)" />
                {/* Coloured dot */}
                <circle cx={x} cy={y} r={DOT_R} fill={color} stroke="white" strokeWidth={2} />

                {/* Institution name label */}
                <text
                  x={x + lbl.dx}
                  y={y + lbl.dy}
                  textAnchor={lbl.anchor}
                  fill="#1a3a30"
                  fontSize={8.5}
                  fontWeight="600"
                  fontFamily="-apple-system, sans-serif"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                  paintOrder="stroke"
                  stroke="white"
                  strokeWidth={3}
                  strokeLinejoin="round"
                >
                  {point.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {tooltip && <Tooltip t={tooltip} />}
    </div>
  );
}
