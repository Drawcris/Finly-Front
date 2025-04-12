'use client'

import Dashboard from "@//components/dashboard/dashboard"
import {Button} from "@/components/ui/button";
import {useAuth} from "@/context/AuthContext";
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {

    const { user, logout, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login')
        }
    }, [isAuthenticated, router])

    return(
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold mb-6">Finly Pulpit</h1>
                <div className="flex items-center space-x-4">
                    <p>{user}</p>
                    <Button className="bg-red-500" onClick={logout}>Wyloguj</Button>
                </div>
            </div>
            <Dashboard />
        </div>
    )

}