import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Transactions} from "@/components/dashboard/Transactions";

export default function Dashboard() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
            <Tabs defaultValue="user-stats" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="user-transactions">Tranzakcje</TabsTrigger>
                </TabsList>
                <TabsContent value="user-transactions">
                    <Transactions />
                </TabsContent>
                <TabsContent value="app-performance">
                </TabsContent>
                <TabsContent value="insights">
                </TabsContent>
                <TabsContent value="user-feedback">
                </TabsContent>
            </Tabs>
        </div>
    )
}
