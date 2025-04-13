'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { useAuth } from "@/context/AuthContext"
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
import { Input } from '@/components/ui/input'

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
    const { user } = useAuth()

    useEffect(() => {
        const fetchTransactionsAndCategories = async () => {
            try {
                const [transactionsRes, categoriesRes] = await Promise.all([
                    api.get(`/transactions/?user=${user}`),
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
            }
        }

        fetchTransactionsAndCategories()
    }, [user])

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

    if (!transactions.length) return <p>Wczytywanie transakcji...</p>

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Historia transakcji</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 rounded-lg border shadow-sm hover:bg-gray-50"
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{transaction.icon}</span>
                                        <span className="text-md font-semibold">
                                            {categories.find((cat) => cat.id === transaction.category)?.name || 'Nieznana'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">{transaction.description || 'Brak opisu'}</span>
                                    <span className="text-sm text-gray-400"><b>{transaction.date}</b></span>
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
                                                    if (editingTransaction) handleEditTransaction(editingTransaction)
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
                                                <DialogFooter className='mt-2'>
                                                    <Button className='bg-green-500 hover:bg-green-600' type="submit">Zapisz</Button>
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
                </CardContent>
            </Card>
        </div>
    )
}