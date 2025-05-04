import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface BudgetSummary {
    id: number;
    category: string;
    icon: string;
    month: string;
    budgeted: number;
    spent: number;
    remaining: number;
    over_budget: boolean;
}

export default function BudgetOverview() {
    const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [newBudget, setNewBudget] = useState<{ category: string; amount: string; month: string }>({
        category: "",
        amount: "",
        month: "",
    });
    const [error, setError] = useState<string | null>(null);

    const fetchBudgets = () => {
        api.get("/budgets-summary/")
            .then((res) => setBudgets(res.data))
            .catch((err) => console.error("Błąd podczas pobierania budżetów:", err));
    };

    const fetchCategories = () => {
        api.get("/categories/")
            .then((res) => setCategories(res.data))
            .catch((err) => console.error("Błąd podczas pobierania kategorii:", err));
    };

    useEffect(() => {
        fetchBudgets();
        fetchCategories();
    }, []);

    const handleAddBudget = async () => {
        if (!newBudget.category || !newBudget.amount || !newBudget.month) {
            setError("Wszystkie pola są wymagane.");
            return;
        }

        try {
            const payload = {
                category: newBudget.category,
                amount: parseFloat(newBudget.amount),
                month: `${newBudget.month}-01`,
            };

            await api.post("/budgets/", payload);

            setError(null);
            setNewBudget({ category: "", amount: "", month: "" });
            fetchBudgets();
        } catch (err: any) {
            console.error("Błąd podczas dodawania budżetu:", err?.response?.data || err.message);
            setError(err?.response?.data?.message || "Nie udało się dodać budżetu.");
        }
    };

    const handleDeleteBudget = async (id: number) => {
        try {
            await api.delete(`/budgets/${id}/`);
            setBudgets((prev) => prev.filter((budget) => budget.id !== id));
        } catch (err) {
            console.error("Błąd podczas usuwania budżetu:", err);
        }
    };

    const formatMonth = (month: string) => {
        const date = new Date(month);
        return date.toLocaleString("pl-PL", { month: "long", year: "numeric" });
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Budżet miesięczny</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-green-500 hover:bg-green-800">Dodaj Budżet</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Dodaj Budżet</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {error && <p className="text-red-600">{error}</p>}
                            <div>
                                <Label>Kategoria</Label>
                                <Select
                                    value={newBudget.category}
                                    onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wybierz kategorię" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Kwota</Label>
                                <Input
                                    type="number"
                                    value={newBudget.amount}
                                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                    placeholder="Kwota (np. 5000.00)"
                                />
                            </div>
                            <div>
                                <Label>Miesiąc</Label>
                                <Input
                                    type="month"
                                    value={newBudget.month}
                                    onChange={(e) => setNewBudget({ ...newBudget, month: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddBudget}>Dodaj</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Kategoria</TableHead>
                        <TableHead>Miesiąc</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Wydano</TableHead>
                        <TableHead>Budżet</TableHead>
                        <TableHead>Postęp</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {budgets.map((b) => {
                        const percentage = Math.min((b.spent / b.budgeted) * 100, 100);

                        return (
                            <TableRow key={`${b.id}-${b.month}`}>
                                <TableCell>
                                    <span className="mr-1">{b.icon}</span>
                                    {b.category}
                                </TableCell>
                                <TableCell>{formatMonth(b.month)}</TableCell>
                                <TableCell className={b.over_budget ? "text-red-600" : "text-green-600"}>
                                    {b.over_budget ? "Przekroczono" : "W normie"}
                                </TableCell>
                                <TableCell>{b.spent.toFixed(2)} zł</TableCell>
                                <TableCell>{b.budgeted.toFixed(2)} zł</TableCell>
                                <TableCell>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                b.over_budget ? "bg-red-500" : "bg-green-500"
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteBudget(b.id)}
                                    >
                                        Usuń
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
