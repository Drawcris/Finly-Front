import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Transactions} from "@/components/dashboard/Transactions";
import {Category} from "@/components/dashboard/Category";
import {DialogExport} from "@/components/dialog/export";
import {TransactionHistory} from "@/components/dashboard/TransactionHistory";
import {DialogAddTransaction} from "@/components/dialog/DialogAddTransaction";

export default function Dashboard() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Panel Analityczny</h1>

            <Tabs defaultValue="user-transactions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="user-transactions">Transakcje</TabsTrigger>
                    <TabsTrigger value="user-transaction-history">Historia transakcji</TabsTrigger>
                    <TabsTrigger value="user-category">Kategorie</TabsTrigger>
                    <DialogExport />
                    <DialogAddTransaction />
                </TabsList>
                <TabsContent value="user-transactions">
                    <Transactions />
                </TabsContent>
                <TabsContent value="user-category">
                    <Category />
                </TabsContent>
                <TabsContent value="user-transaction-history">
                    <TransactionHistory />
                </TabsContent>
            </Tabs>
        </div>
    )
}
