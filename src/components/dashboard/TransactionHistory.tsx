'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { Trash, Edit } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

type Transaction = {
    id: number
    description: string
    amount: number
    type: 'income' | 'expense'
    date: string
    category: number
    icon?: string
}

export function TransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [categories, setCategories] = useState<{ id: number; name: string; icon: string }[]>([])
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [filterType, setFilterType] = useState<string | undefined>(undefined)
    const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)
    const [startDate, setStartDate] = useState<string | undefined>(undefined)
    const [endDate, setEndDate] = useState<string | undefined>(undefined)
    const [sortOrder, setSortOrder] = useState<string>('date')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchTransactionsAndCategories = async () => {
            setIsLoading(true)
            try {
                const [transactionsRes, categoriesRes] = await Promise.all([
                    api.get(`/transaction-list/`, { params: buildFilterParams() }),
                    api.get('/categories/')
                ])
                const categoriesMap = categoriesRes.data.reduce((map: Record<number, string>, category: any) => {
                    map[category.id] = category.icon
                    return map
                }, {})
                const transactionsWithIcons = transactionsRes.data.map((transaction: any) => ({
                    ...transaction,
                    icon: categoriesMap[transaction.category] || '❓',
                }))
                setTransactions(transactionsWithIcons)
                setCategories(categoriesRes.data)
            } catch (err) {
                console.error('Błąd podczas pobierania danych:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTransactionsAndCategories()
    }, [filterType, filterCategory, startDate, endDate, sortOrder])

    const buildFilterParams = () => {
        const params: Record<string, string> = {}
        if (filterType) params.type = filterType
        if (filterCategory) params.category = filterCategory
        if (startDate) params.start_date = startDate
        if (endDate) params.end_date = endDate
        if (sortOrder === 'highest') {
            params.order_by = 'highest'
        } else if (sortOrder === 'lowest') {
            params.order_by = 'lowest'
        } else {
            params.order_by = 'date'
        }
        return params
    }

    const handleEditTransaction = async (updatedTransaction: Transaction) => {
        try {
            await api.put(`/transactions/${updatedTransaction.id}/`, updatedTransaction)
            setTransactions((prev) =>
                prev.map((transaction) =>
                    transaction.id === updatedTransaction.id ? updatedTransaction : transaction
                )
            )
            setEditingTransaction(null)
        } catch (err) {
            console.error('Błąd podczas edycji transakcji:', err)
        }
    }

    const handleDeleteTransaction = async (transactionId: number) => {
        try {
            await api.delete(`/transactions/${transactionId}/`)
            setTransactions((prev) => prev.filter((transaction) => transaction.id !== transactionId))
        } catch (err) {
            console.error('Błąd podczas usuwania transakcji:', err)
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Historia transakcji</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="filters flex flex-wrap gap-2 mb-4 items-center">
                        <Select
                            value={filterType || ''}
                            onValueChange={(value) => setFilterType(value === 'all' ? undefined : value)}
                        >
                            <SelectTrigger className="border rounded p-2 w-[180px]">
                                <SelectValue placeholder="Typ (wszystkie)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Typ (wszystkie)</SelectItem>
                                <SelectItem value="income">+ Przychód</SelectItem>
                                <SelectItem value="expense">- Wydatek</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filterCategory || ''}
                            onValueChange={(value) => setFilterCategory(value === 'all' ? undefined : value)}
                        >
                            <SelectTrigger className="border rounded p-2 w-[180px]">
                                <SelectValue placeholder="Kategoria (wszystkie)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Kategoria (wszystkie)</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.name)}>
                                        {category.icon} {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-col gap-2 mb-5">
                            <Label>Data Początkowa:</Label>
                            <Input
                                type="date"
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder="Data początkowa"
                                className="w-36"
                            />
                        </div>
                        <div className="flex flex-col gap-2 mb-5">
                            <Label>Data Końcowa:</Label>
                            <Input
                                type="date"
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="Data końcowa"
                                className="w-36"
                            />
                        </div>
                        <Select
                            value={sortOrder}
                            onValueChange={setSortOrder}
                        >
                            <SelectTrigger className="border rounded p-2 w-[180px]">
                                <SelectValue placeholder="Sortuj" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Data (najnowsze)</SelectItem>
                                <SelectItem value="highest">Kwota (najwyższa)</SelectItem>
                                <SelectItem value="lowest">Kwota (najniższa)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <p>Wczytywanie transakcji...</p>
                    ) : transactions.length === 0 ? (
                        <div className="text-center">
                            <p className="text-gray-500">Brak wyników dla wybranych filtrów.</p>
                            <p className="text-sm text-gray-400">Zmień filtry, aby zobaczyć wyniki.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className={`flex items-center justify-between p-4 rounded-lg border shadow-sm hover:bg-gray-50`}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{transaction.icon}</span>
                                            <span className="text-md font-semibold">
                                                {
                                                    categories.find(
                                                        (cat) => cat.id === transaction.category
                                                    )?.name || 'Nieznana'
                                                }
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {transaction.description || 'Brak opisu'}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            <b>{transaction.date}</b>
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <span
                                            className={
                                                transaction.type === 'income'
                                                    ? 'text-green-500 font-medium'
                                                    : 'text-red-500 font-medium'
                                            }
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {transaction.amount} zł
                                        </span>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button
                                                    title="Edytuj transakcję"
                                                    onClick={() => setEditingTransaction(transaction)}
                                                    className="text-blue-500 hover:text-blue-700 transition"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edytuj transakcję</DialogTitle>
                                                </DialogHeader>
                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault()
                                                        if (editingTransaction)
                                                            handleEditTransaction(editingTransaction)
                                                    }}
                                                >
                                                    <div className="space-y-4">
                                                        <Input
                                                            type="text"
                                                            value={editingTransaction?.description || ''}
                                                            onChange={(e) =>
                                                                setEditingTransaction({
                                                                    ...editingTransaction!,
                                                                    description: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Opis transakcji"
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={editingTransaction?.amount || ''}
                                                            onChange={(e) =>
                                                                setEditingTransaction({
                                                                    ...editingTransaction!,
                                                                    amount: parseFloat(e.target.value),
                                                                })
                                                            }
                                                            placeholder="Kwota"
                                                        />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit">Zapisz</Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>

                                        <button
                                            title="Usuń transakcję"
                                            onClick={() => handleDeleteTransaction(transaction.id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                        >
                                            <Trash size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}