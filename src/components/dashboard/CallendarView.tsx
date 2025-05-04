import { useEffect, useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from "@/context/AuthContext"
import { format, parseISO } from 'date-fns'
import api from '@/lib/api'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


type Transaction = {
    id: number
    date: string
    amount: number
    type: 'income' | 'expense'
    description: string
}

export default function CalendarView() {
    const { user } = useAuth()
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [transactions, setTransactions] = useState<Transaction[]>([])

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('/transactions/')
                setTransactions(res.data)
            } catch (error) {
                console.error("Błąd podczas ładowania transakcji:", error)
            }
        }

        fetchTransactions()
    }, [user])

    const getTransactionsForDate = (date: Date | undefined) => {
        if (!date) return []
        const formatted = format(date, 'yyyy-MM-dd')
        return transactions.filter(t => t.date === formatted)
    }

    const incomeDates = new Set(
        transactions.filter(t => t.type === 'income').map(t => format(parseISO(t.date), 'yyyy-MM-dd'))
    )
    const expenseDates = new Set(
        transactions.filter(t => t.type === 'expense').map(t => format(parseISO(t.date), 'yyyy-MM-dd'))
    )
    const bothDates = new Set(
        [...incomeDates].filter(date => expenseDates.has(date))
    )

    bothDates.forEach(date => {
        incomeDates.delete(date)
        expenseDates.delete(date)
    })

    const dailyTransactions = getTransactionsForDate(selectedDate)

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Kalendarz transakcji</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className=" rounded-md border shadow pl-20"
                    modifiers={{
                        income: Array.from(incomeDates).map(date => parseISO(date)),
                        expense: Array.from(expenseDates).map(date => parseISO(date)),
                        both: Array.from(bothDates).map(date => parseISO(date)),
                    }}
                    modifiersClassNames={{
                        income: "bg-green-200",
                        expense: "bg-red-200",
                        both: "bg-purple-200",
                    }}
                />

                <div className="p-4 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold mb-2">
                        Transakcje z dnia: {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '–'}
                    </h3>
                    {dailyTransactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Brak transakcji.</p>
                    ) : (
                        <Table>
                            <TableCaption>Lista transakcji</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Opis</TableHead>
                                    <TableHead>Typ</TableHead>
                                    <TableHead className="text-right">Kwota</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dailyTransactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">{t.description || 'Brak opisu'}</TableCell>
                                        <TableCell>{t.type === 'income' ? 'Przychód' : 'Wydatek'}</TableCell>
                                        <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.amount} zł
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    )
}