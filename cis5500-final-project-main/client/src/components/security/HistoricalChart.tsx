import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type History = {
    date: string,
    adj_close: number
}[]

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })


export const HistoricalChart = ({ history }: { history: History }) =>
    <ResponsiveContainer width={600} height={350}>
        <LineChart width={600} height={350} data={history} margin={{ bottom: 20 }}>
            <CartesianGrid />
            <XAxis dataKey="date" {...history ? { interval: Math.floor(history.length / 4) } : {}} />
            <YAxis label={{ angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }} tickFormatter={currencyFormatter.format} width={90} />
            <Tooltip formatter={(value) => [`${typeof (value) === "number" ? currencyFormatter.format(value) : value}`, "Adjusted Close"]} />
            <Line type="monotone" dataKey="adj_close" stroke="#000" dot={false} />
        </LineChart>
    </ResponsiveContainer>