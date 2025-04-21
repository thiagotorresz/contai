import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  PieLabelRenderProps
} from 'recharts';

interface ExpenseData {
  categoria: string;
  valor: number;
}

interface ExpenseChartProps {
  expenses: ExpenseData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Custom label com nome da categoria + porcentagem na mesma linha
const renderCustomLabel = ({
  cx, cy, midAngle, outerRadius, index, percent
}: PieLabelRenderProps) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius! + 30; // Afastar do centro
  const x = cx! + radius * Math.cos(-midAngle! * RADIAN);
  const y = cy! + radius * Math.sin(-midAngle! * RADIAN);

  const color = COLORS[index! % COLORS.length];
  const percentage = (percent! * 100).toFixed(1);

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill={color}
      fontSize={12}
      fontWeight="500"
    >
      {`${renderCustomLabel.name?.toUpperCase()} ${percentage}%`}
    </text>
  );
};

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  const total = expenses.reduce((sum, expense) => sum + expense.valor, 0);

  const data = expenses.map((expense) => ({
    name: expense.categoria,
    value: expense.valor,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Distribuição de Despesas</h2>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ cx, cy, midAngle, outerRadius, index, percent }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius! + 30;
                const x = cx! + radius * Math.cos(-midAngle! * RADIAN);
                const y = cy! + radius * Math.sin(-midAngle! * RADIAN);
                const color = COLORS[index! % COLORS.length];
                const name = data[index!].name;
                const percentage = ((percent! * 100)).toFixed(1);

                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={color}
                    fontSize={12}
                  >
                    {`${name} (${percentage}%)`}
                  </text>
                );
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              `}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
