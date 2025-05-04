import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, Legend, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import api from "@/lib/api";

type StatsResponse = {
    balance: number;
    last_30_days: {
        income: number;
        expense: number;
    };
    most_expense_category: {
        name: string;
        amount: number;
        icon: string;
    };
    monthly: {
        [month: string]: {
            income: number;
            expense: number;
        };
    };
};

export function TransactionsView() {
    const [stats, setStats] = useState<StatsResponse | null>(null);

    useEffect(() => {
        api
            .get("/statistics/")
            .then((res) => setStats(res.data))
            .catch((err) => console.error(err));
    }, []);

    if (!stats) return <p>Loading...</p>;

    const monthlyData = Object.entries(stats.monthly)
        .map(([month, values]) => ({
            name: month,
            income: values.income,
            expense: values.expense,
        }))
        .reverse();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Balans</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-green-500">{stats.balance} zł</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Przychody z ostatnich 30 dni</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-green-500">{stats.last_30_days.income} zł</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wydatki z ostatnich 30 dni</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-red-500">{stats.last_30_days.expense} zł</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Najwięcej wydajesz na:</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.most_expense_category.name} {stats.most_expense_category.icon}
                    </div>
                    <p>Wydałeś łącznie: {stats.most_expense_category.amount} zł</p>
                </CardContent>
            </Card>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Wydatki na tle miesięcy</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                            data={monthlyData}
                            margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
                        >
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    backgroundColor: "#f9f9f9",
                                    border: "1px solid #ddd",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                }}
                                formatter={(value: number, name: string) => [`${value} zł`, name]}
                            />
                            <Legend verticalAlign="top" align="right" iconType="circle" />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#22c55e"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{
                                    r: 6,
                                    stroke: "#22c55e",
                                    strokeWidth: 2,
                                }}
                                name="Przychody"
                            />
                            <Line
                                type="monotone"
                                dataKey="expense"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{
                                    r: 6,
                                    stroke: "#ef4444",
                                    strokeWidth: 2,
                                }}
                                name="Wydatki"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}