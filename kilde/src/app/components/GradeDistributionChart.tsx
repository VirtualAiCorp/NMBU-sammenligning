import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { GradeData } from './CourseComparison';

interface GradeDistributionChartProps {
  data: GradeData[];
}

// Paletten er satt saman for å vere lett å skilje ved sida av kvarandre:
// kontrastpar på tvers av varm/kald, mørk/lys og fargehjulet
const COLORS = [
  '#025c4f', // NMBU-grønn (anker)
  '#e05c2a', // raudoransje
  '#3a7fc1', // mellomblå
  '#c2963a', // amber
  '#7b3fa0', // lilla
  '#2ea87e', // mint-grøn
  '#c13a5a', // rosa-raud
  '#4e7fc4', // lyseblå
  '#6b8c2a', // olivengrønn
  '#c17a3a', // brun-oransje
];

export function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  const chartData = ['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => {
    const row: Record<string, number | string> = { grade };
    data.forEach((uni) => {
      const count = uni.grades[grade as keyof typeof uni.grades];
      const pct = uni.totalStudents > 0
        ? parseFloat(((count / uni.totalStudents) * 100).toFixed(1))
        : 0;
      row[uni.universityName] = pct;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="grade" />
        <YAxis label={{ value: 'Prosent (%)', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value: number) => `${value}%`} />
        <Legend />
        {data.map((uni, index) => (
          <Bar
            key={`bar-${uni.university}`}
            dataKey={uni.universityName}
            name={uni.universityName}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
