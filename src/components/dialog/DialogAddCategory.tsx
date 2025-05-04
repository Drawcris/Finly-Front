import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import api from "@/lib/api";

export function DialogAddCategory() {
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryIcon, setNewCategoryIcon] = useState("")
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([])

    const handleAddCategory = async () => {
        const payload = { name: newCategoryName, icon: newCategoryIcon }
        try {
            const res = await api.post("/categories/", payload)

            setCategories((prevCategories) => [
                ...prevCategories,
                { id: res.data.id, name: res.data.name },
            ])
            setNewCategoryName("")
            setNewCategoryIcon("")

            alert("Kategoria dodana pomyślnie!")
            window.location.reload();
        } catch (err) {
            console.error("Błąd przy dodawaniu kategorii:", err)
        }
    }


    return (
        <>
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600">
                    Dodaj kategorię
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Dodaj nową kategorię</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Nazwa</Label>
                        <Input
                            type="text"
                            placeholder="Wprowadź nazwę kategorii"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Ikona (opcjonalnie)</Label>
                        <Input
                            type="text"
                            placeholder="Wprowadź ikonę kategorii"
                            value={newCategoryIcon}
                            onChange={(e) => setNewCategoryIcon(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleAddCategory}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        Zapisz
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}