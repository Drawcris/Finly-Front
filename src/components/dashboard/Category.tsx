'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import {DialogAddCategory} from "@/components/dialog/DialogAddCategory";
import api from '@/lib/api'

type StatsResponse = {
    balance: number
    last_30_days: {
        income: number
        expense: number
    }
    most_expense_category: {
        name: string
        amount: number
        icon: string
    }
    by_category: {
        [category: string]: {
            income: number
            expense: number
            icon: string
        }
    }
    monthly: {
        [month: string]: {
            income: number
            expense: number
        }
    }
}



export function Category() {
    const [stats, setStats] = useState<StatsResponse | null>(null)

    useEffect(() => {
        api
            .get('/statistics/')
            .then((res) => setStats(res.data))
            .catch((err) => console.error(err))
    }, [])

    if (!stats) return <p>Loading...</p>

    const categoryData = Object.entries(stats.by_category).map(([category, values]) => ({
        name: category,
        income: values.income,
        expense: values.expense,
    }))

    const incomeData = categoryData
        .filter(({ income }) => income > 0)
        .map(({ name, income }) => ({
            name,
            value: income,
        }))

    const expenseData = categoryData
        .filter(({ expense }) => expense > 0)
        .map(({ name, expense }) => ({
            name,
            value: expense,
        }))

    // Kolory dla segmentów
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF5E5E', '#9155FD'];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Lista kategorii */}
            <Card className="col-span-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Transakcje według kategorii</CardTitle>
                        <DialogAddCategory />
                    </div>

                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(stats.by_category).map(([categoryName, categoryData], index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 rounded-lg border shadow-sm hover:bg-gray-50"
                            >
                                {/* Lewa sekcja: Ikona i nazwa kategorii */}
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{categoryData.icon}</span>
                                    <span className="text-md font-semibold">{categoryName}</span>
                                </div>

                                {/* Prawa sekcja: Przychody i wydatki */}
                                <div className="flex items-center gap-4">
                                    <span className="text-green-500 font-medium">+{categoryData.income} zł</span>
                                    <span className="text-red-500 font-medium">-{categoryData.expense} zł</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Przychody według kategorii</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={incomeData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                fill="#82ca9d"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Etykiety z kategorią i procentowym udziałem
                            >
                                {incomeData.map((_, index) => (
                                    <Cell key={`cell-income-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Wydatki według kategorii</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={expenseData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                fill="#ff6b6b"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Etykiety z kategorią i procentowym udziałem
                            >
                                {expenseData.map((_, index) => (
                                    <Cell key={`cell-expense-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}