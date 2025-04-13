'use client'

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns" // Potrzebne do formatowania daty
import {DialogAddCategory} from "@/components/dialog/DialogAddCategory";
import api from "@/lib/api"

export function DialogAddTransaction() {
    const [amount, setAmount] = useState("")
    const [type, setType] = useState("income")
    const [category, setCategory] = useState<number | null>(null)
    const [description, setDescription] = useState("")
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([])


    useEffect(() => {
        // Pobierz kategorie z API
        api.get("/categories/").then((res) => setCategories(res.data))
    }, [])

    const handleSubmit = async () => {
        const payload = {
            amount: parseFloat(amount),
            type,
            category, // ID kategorii jako liczba
            description,
            date: date?.toISOString().split("T")[0], // Formatowanie dla API (YYYY-MM-DD)
        }

        try {
            await api.post("/transactions/", payload)
            window.location.reload() // Ewentualnie odświeżenie strony
        } catch (err: any) {
            console.error("Błąd przy dodawaniu transakcji", err.response?.data)
        }
    }


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="ml-1 bg-blue-500 hover:bg-blue-600">
                    Dodaj transakcję
                    <i className="bi bi-bag-plus-fill"></i>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Dodaj nową transakcję</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Kwota */}
                    <div>
                        <Label>Kwota</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    {/* Typ transakcji */}
                    <div>
                        <Label>Typ transakcji</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Wybierz typ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Przychód</SelectItem>
                                <SelectItem value="expense">Wydatek</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Kategoria */}
                    <div>
                        <Label>Kategoria</Label>
                        <div className="flex items-center space-x-2">
                            <Select
                                value={category !== null ? category.toString() : ""}
                                onValueChange={(value) => setCategory(Number(value))} // Konwersja na number
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz kategorię" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Przycisk dodawania kategorii */}
                            <DialogAddCategory />
                        </div>
                    </div>


                    {/* Data */}
                    <div>
                        <Label>Data</Label>
                        <Calendar
                            selected={date} // Aktualna data
                            onSelect={(newDate) => setDate(newDate as Date)} // Zapisz nową datę
                            mode="single" // Wybór pojedynczego dnia
                            className="border rounded-md" // Stylizacja komponentu
                        />
                        {date && (
                            <p className="text-sm text-gray-500">
                                Wybrana data: {format(date, "yyyy-MM-dd")}
                            </p>
                        )}
                    </div>


                    {/* Opis */}
                    <div>
                        <Label>Opis</Label>
                        <Textarea
                            placeholder="Opis transakcji"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={handleSubmit}
                    >
                        Zapisz
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}