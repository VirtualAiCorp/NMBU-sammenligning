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

export default defineConfig({
  plugins: [
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
