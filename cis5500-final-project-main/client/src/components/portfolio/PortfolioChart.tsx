import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type History = {
    date: string,
    value: number
}[]

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const PortfolioChart = ({ history }: { history: History }) =>
    <ResponsiveContainer width={800} height={350}>
        <LineChart width={800} height={350} data={history}>
            <CartesianGrid />
            <XAxis dataKey="date" {...history ? { interval: Math.floor(history.length / 4) } : {}} />
            <YAxis label={{ angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }} tickFormatter={currencyFormatter.format} width={90} />
            <Tooltip formatter={(value) => [`${typeof (value) === "number" ? currencyFormatter.format(value) : value}`, "Portfolio Value"]} />
            <Line type="monotone" dataKey="value" stroke="#000" dot={false} />
        </LineChart>
    </ResponsiveContainer>