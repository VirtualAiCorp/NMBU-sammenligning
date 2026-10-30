import fs from 'node:fs'
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Bygg uten Handelshøyskolen (det åpne nettstedet): HH-komponenter og HH-datasett byttes ut
// med tomme stubber, slik at ingenting fra HH havner i bunten. Se docs/publisering-cloudflare.md.
const UTEN_HH = process.env.VITE_UTEN_HH === '1'
const HH_KOMPONENTER = [
  'CourseSelector', 'CourseComparison', 'UniversityFilter', 'CourseMappingTable', 'AdmissionStats',
  'StudiebarometerStats', 'GradingHarshnessSummary', 'GradeInflationDashboard', 'MapView',
  'FirstYearComparison', 'OnlineBachelorView', 'MasterView', 'MasterComparisonChart',
  'NMBUMasterAnalysis', 'AdmissionAnalysis2026', 'MarkedsstatusView',
]
const HH_DATA = ['fullAdmissionData', 'samfData', 'annualStudiesData']
const hhAlias = UTEN_HH
  ? [
      { find: new RegExp(`^\\./components/(${HH_KOMPONENTER.join('|')})$`), replacement: path.resolve(__dirname, 'src/app/hh-stub.tsx') },
      { find: new RegExp(`^\\.\\./data/(${HH_DATA.join('|')})$`), replacement: path.resolve(__dirname, 'src/app/hh-stub-data.ts') },
    ]
  : []

// Uten HH skal heller ikke HHs styrepapirer (public/markedsstatus/hh) være med i bygget.
let utMappe = 'dist'
const fjernHhPdf = {
  name: 'fjern-hh-markedsstatus',
  apply: 'build' as const,
  configResolved(c: { root: string; build: { outDir: string } }) { utMappe = path.resolve(c.root, c.build.outDir) },
  closeBundle() {
    if (UTEN_HH) fs.rmSync(path.join(utMappe, 'markedsstatus', 'hh'), { recursive: true, force: true })
  },
}

// Bygg med bare rangeringen (VITE_KUN_RANGERING=1, Cloudflare-prosjektet «hh-rangering»): egen inngang
// (src/rangering-main.tsx), egen tittel, ingen public-mappe (416 MB med alt annet) bortsett fra den krypterte
// rangeringsfila, og egen utmappe (dist-rangering).
const KUN_RANGERING = process.env.VITE_KUN_RANGERING === '1'
let rangeringUt = 'dist-rangering'
const kunRangering = {
  name: 'kun-rangering',
  configResolved(c: { root: string; build: { outDir: string } }) { rangeringUt = path.resolve(c.root, c.build.outDir) },
  // order 'pre': inngangen må byttes før Vite leser skriptene i index.html
  transformIndexHtml: { order: 'pre' as const, handler(html: string) {
    if (!KUN_RANGERING) return html
    return html
      .replace('/src/main.tsx', '/src/rangering-main.tsx')
      .replace(/<title>[^<]*<\/title>/, '<title>Norwegian Business School Ranking (utkast)</title>')
      .replace(/(<meta name="description" content=")[^"]*/, '$1Utkast til rangering av norske handelshøyskoler: forskning, utdanning og anerkjennelse. Låst med passord.')
      .replace(/(<meta property="og:title" content=")[^"]*/, '$1Norwegian Business School Ranking (utkast)')
      .replace(/(<meta property="og:description" content=")[^"]*/, '$1Utkast til rangering av norske handelshøyskoler. Låst med passord.')
  } },
  closeBundle() {
    if (!KUN_RANGERING) return
    const kilde = path.resolve(__dirname, 'public', 'rangering-data.json')
    if (fs.existsSync(rangeringUt) && fs.existsSync(kilde)) fs.copyFileSync(kilde, path.join(rangeringUt, 'rangering-data.json'))
  },
}

// Bygg med bare AJG-analysen (VITE_KUN_AJG=1, Cloudflare-prosjektet «ajg-analyse-hh»): egen inngang (src/ajg-main.tsx),
// alltid arbeidsflate-oppsettet, ingen public-mappe bortsett fra den krypterte datafila (ajg-data.json, laget av
// scripts/rangering/ajg_analyse.py med AJG_PASSORD), og egen utmappe (dist-ajg).
const KUN_AJG = process.env.VITE_KUN_AJG === '1'
let ajgUt = 'dist-ajg'
const kunAjg = {
  name: 'kun-ajg',
  configResolved(c: { root: string; build: { outDir: string } }) { ajgUt = path.resolve(c.root, c.build.outDir) },
  transformIndexHtml: { order: 'pre' as const, handler(html: string) {
    if (!KUN_AJG) return html
    return html
      .replace('/src/main.tsx', '/src/ajg-main.tsx')
      .replace(/<title>[^<]*<\/title>/, '<title>AJG-Analyse HH</title>')
      .replace(/(<meta name="description" content=")[^"]*/, '$1AJG 2024 etter fagområde ved norske handelshøyskoler: samfunnsøkonomi mot andre fagområder. Låst med passord.')
      .replace(/(<meta property="og:title" content=")[^"]*/, '$1AJG-Analyse HH')
      .replace(/(<meta property="og:description" content=")[^"]*/, '$1AJG 2024 etter fagområde ved norske handelshøyskoler. Låst med passord.')
      .replace('</head>', '<script>document.documentElement.setAttribute("data-oppsett","arbeidsflate")</script>'
        + '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&display=swap" /></head>')
  } },
  closeBundle() {
    if (!KUN_AJG) return
    for (const fil of ['ajg-data.json', 'ajg-rangering.json']) {
      const kilde = path.resolve(__dirname, 'public', fil)
      if (fs.existsSync(ajgUt) && fs.existsSync(kilde)) fs.copyFileSync(kilde, path.join(ajgUt, fil))
    }
  },
}

export default defineConfig({
  publicDir: KUN_RANGERING || KUN_AJG ? false : 'public',
  build: KUN_RANGERING ? { outDir: 'dist-rangering' } : KUN_AJG ? { outDir: 'dist-ajg' } : undefined,
  plugins: [
    kunRangering,
    kunAjg,
    fjernHhPdf,
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      // Alias @ to the src directory
      { find: '@', replacement: path.resolve(__dirname, './src') },
      ...hhAlias,
    ],
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv', '**/*.pdf', '**/*.PDF'],

  server: {
    proxy: {
      '/karakterweb-api': {
        target: 'https://api.karakterweb.no/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/karakterweb-api/, ''),
        headers: {
          'X-Client-Key': 'kw_pk_5X5FLyOEzXyf1zslyElsr4GkmbfmZPl72I_ON5XxpiI',
        },
      },
      '/dbh-api': {
        target: 'https://dbh.hkdir.no/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dbh-api/, ''),
      },
    },
  },
})
