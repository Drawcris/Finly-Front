'use client'

import { useState, useEffect } from 'react'
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from '@/components/ui/table'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from '@/components/ui/pagination'
import * as XLSX from 'xlsx'
// @ts-ignore
import { saveAs } from 'file-saver'

type Transaction = {
    id: number
    description: string
    amount: number
    type: 'income' | 'expense'
    date: string
    category: number
    icon?: string
}

export function TransactionHistoryView() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [categories, setCategories] = useState<{ id: number; name: string; icon: string }[]>([])
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [filterType, setFilterType] = useState<string | undefined>(undefined)
    const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)
    const [startDate, setStartDate] = useState<string | undefined>(undefined)
    const [endDate, setEndDate] = useState<string | undefined>(undefined)
    const [sortOrder, setSortOrder] = useState<string>('date')
    const [isLoading, setIsLoading] = useState(true)

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

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
                setCurrentPage(1)
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

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(transactions.map((t) => ({
            Data: t.date,
            Opis: t.description,
            Kwota: (t.type === 'income' ? '+' : '-') + t.amount + ' zł',
            Typ: t.type === 'income' ? 'Przychód' : 'Wydatek',
            Kategoria: categories.find((c) => c.id === t.category)?.name || 'Nieznana',
        })))
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transakcje')
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
        saveAs(blob, 'transakcje.xlsx')
    }

    const paginatedTransactions = transactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )
    const totalPages = Math.ceil(transactions.length / itemsPerPage)

    return (
        <div className="space-y-6">
            <div className="filters flex flex-wrap gap-4 items-end">
                <Select
                    value={filterType || ''}
                    onValueChange={(value) => setFilterType(value === 'all' ? undefined : value)}
                >
                    <SelectTrigger className="w-[180px]">
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
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Kategoria (wszystkie)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Kategoria (wszystkie)</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                                {category.icon} {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex flex-col">
                    <Label>Data od</Label>
                    <Input type="date" onChange={(e) => setStartDate(e.target.value)} className="w-[150px]" />
                </div>

                <div className="flex flex-col">
                    <Label>Data do</Label>
                    <Input type="date" onChange={(e) => setEndDate(e.target.value)} className="w-[150px]" />
                </div>

                <Select
                    value={sortOrder}
                    onValueChange={setSortOrder}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sortuj" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Data (najnowsze)</SelectItem>
                        <SelectItem value="highest">Kwota (najwyższa)</SelectItem>
                        <SelectItem value="lowest">Kwota (najniższa)</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={exportToExcel}>
                    📁 Exportuj do Excel
                </Button>
            </div>

            {isLoading ? (
                <p>Wczytywanie danych...</p>
            ) : transactions.length === 0 ? (
                <p>Brak transakcji.</p>
            ) : (
                <>
                    <Table>
                        <TableCaption>Historia transakcji</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Opis</TableHead>
                                <TableHead>Kategoria</TableHead>
                                <TableHead>Typ</TableHead>
                                <TableHead className="text-right">Kwota</TableHead>
                                <TableHead className="text-right">Akcje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{transaction.date}</TableCell>
                                    <TableCell>{transaction.description || 'Brak opisu'}</TableCell>
                                    <TableCell>
                                        {transaction.icon} {' '}
                                        {categories.find((cat) => cat.id === transaction.category)?.name || 'Nieznana'}
                                    </TableCell>
                                    <TableCell>{transaction.type === 'income' ? 'Przychód' : 'Wydatek'}</TableCell>
                                    <TableCell className="text-right">
                    <span
                        className={
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }
                    >
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount} zł
                    </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingTransaction(transaction)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
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
                                                    <DialogFooter>
                                                        <Button type="submit">Zapisz</Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeleteTransaction(transaction.id)}
                                        >
                                            <Trash size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                            <PaginationItem>
                <span className="text-sm px-2">
                  Strona {currentPage} z {totalPages}
                </span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </>
            )}
        </div>
    )
}
