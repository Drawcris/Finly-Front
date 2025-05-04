import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionsView} from "@/components/dashboard/TransactionsView";
import {CategoryView} from "@/components/dashboard/CategoryView";
import {DialogExport} from "@/components/dialog/export";
import {TransactionHistoryView} from "@/components/dashboard/TransactionHistoryView";
import {DialogAddTransaction} from "@/components/dialog/DialogAddTransaction";
import CalendarView from  "@/components/dashboard/CallendarView";
import BudgetOverview from "@/components/dashboard/BudgetsView";

export default function Dashboard() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Panel Analityczny</h1>

            <Tabs defaultValue="user-transactions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="user-transactions">Podsumowanie</TabsTrigger>
                    <TabsTrigger value="user-transaction-history">Historia transakcji</TabsTrigger>
                    <TabsTrigger value="user-calendar">Kalendarz</TabsTrigger>
                    <TabsTrigger value="user-category">Kategorie</TabsTrigger>
                    <TabsTrigger value="user-budget">Budżet</TabsTrigger>
                    <DialogExport />
                    <DialogAddTransaction />
                </TabsList>
                <TabsContent value="user-transactions">
                    <TransactionsView />
                </TabsContent>
                <TabsContent value="user-category">
                    <CategoryView />
                </TabsContent>
                <TabsContent value="user-transaction-history">
                    <TransactionHistoryView />
                </TabsContent>
                <TabsContent value="user-calendar">
                    <CalendarView />
                </TabsContent>
                <TabsContent value="user-budget">
                    <BudgetOverview />
                </TabsContent>
            </Tabs>
        </div>
    )
}
