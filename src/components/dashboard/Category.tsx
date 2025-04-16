'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DialogAddCategory } from "@/components/dialog/DialogAddCategory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '@/lib/api';

type CategoryStats = {
    category: string;
    icon: string;
    total_expense: number;
    total_income: number;
};

export function Category() {
    const [categories, setCategories] = useState<CategoryStats[]>([]);
    const [orderBy, setOrderBy] = useState('total_expense'); // Domyślnie sortuj po wydatkach
    const [direction, setDirection] = useState('desc'); // Domyślna kolejność malejąca
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/category-list/', {
                    params: {
                        order_by: orderBy,
                        direction: direction,
                    },
                });
                setCategories(res.data);
            } catch (error) {
                console.error('Błąd podczas pobierania kategorii:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, [orderBy, direction]); // Odświeża dane przy zmianie sortowania

    if (isLoading) return <p>Ładowanie kategorii...</p>;

    // Dane do wykresu przychodów i wydatków
    const incomeData = categories
        .filter(({ total_income }) => total_income > 0)
        .map(({ category, total_income }) => ({
            name: category,
            value: total_income,
        }));

    const expenseData = categories
        .filter(({ total_expense }) => total_expense > 0)
        .map(({ category, total_expense }) => ({
            name: category,
            value: total_expense,
        }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF5E5E', '#9155FD'];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="col-span-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Transakcje według kategorii</CardTitle>
                        <DialogAddCategory />
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Panel sortowania */}
                    <div className="mb-4 flex items-center space-x-4">
                        {/* Sortowanie według */}
                        <div>
                            <label htmlFor="order-by" className="text-sm font-medium block mb-1">
                                Sortuj według:
                            </label>
                            <Select value={orderBy} onValueChange={setOrderBy}>
                                <SelectTrigger id="order-by" className="w-[200px]">
                                    <SelectValue placeholder="Wybierz opcję" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="total_expense">Wydatki</SelectItem>
                                    <SelectItem value="total_income">Przychody</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Kierunek sortowania */}
                        <div>
                            <label htmlFor="direction" className="text-sm font-medium block mb-1">
                                Kierunek:
                            </label>
                            <Select value={direction} onValueChange={setDirection}>
                                <SelectTrigger id="direction" className="w-[200px]">
                                    <SelectValue placeholder="Wybierz kierunek" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Malejąco</SelectItem>
                                    <SelectItem value="asc">Rosnąco</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Lista kategorii */}
                    <div className="space-y-4">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 rounded-lg border shadow-sm hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{category.icon}</span>
                                    <span className="text-md font-semibold">{category.category}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-green-500 font-medium">
                                        +{category.total_income} zł
                                    </span>
                                    <span className="text-red-500 font-medium">
                                        -{category.total_expense} zł
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Wykres przychodów */}
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
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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

            {/* Wykres wydatków */}
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
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
    );
}