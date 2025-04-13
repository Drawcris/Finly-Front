import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"

export function DialogExport() {

    const handleDownloadCSV = () => {
        const url = "http://127.0.0.1:8000/api/export-csv"
        window.open(url, "_blank")
    }
    const handleDownloadPDF = () => {
        const url = "http://127.0.0.1:8000/api/export-pdf"
        window.open(url, "_blank")
    }


    return(
        <Dialog>
            <DialogTrigger asChild>
                <Button className="ml-3 bg-green-500 hover:bg-green-600 ">Exportuj
                    <i className="bi bi-file-earmark-pdf-fill"></i></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Exportuj raport do pliku</DialogTitle>
                    <DialogDescription>
                        Wybierz format pliku.
                    </DialogDescription>
                    <div className="flex mt-2 justify-center gap-5">
                        <Button onClick={handleDownloadPDF} className='w-24 bg-blue-500 hover:bg-blue-600'>PDF
                            <i className="bi bi-filetype-pdf"></i></Button>
                        <Button onClick={handleDownloadCSV} className='w-24 bg-green-500 hover:bg-green-600'>CSV
                            <i className="bi bi-filetype-csv"></i> </Button>

                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
        )
    }