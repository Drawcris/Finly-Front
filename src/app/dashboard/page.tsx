'use client'

import Dashboard from "@//components/dashboard/dashboard"
import {Button} from "@/components/ui/button";
import {useAuth} from "@/context/AuthContext";
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {

    const { user, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) {
            router.push('/auth/login');
        }
    }, [router]);


    return(
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold mb-6">Finly.io</h1>
                <div className="flex items-center space-x-4">
                    <p className="text-lg font-medium text-gray-600 space-x-1">
                        <b>{user}</b>
                        <i className="bi bi-person-fill"></i>
                    </p>

                    <Button onClick={logout} variant="outline" className="inline-flex items-center space-x-2 text-red-500 hover:text-red-600">
                        <span>Wyloguj</span>
                        <i className="bi bi-box-arrow-left"></i>
                    </Button>
                </div>
            </div>
            <Dashboard />
        </div>
    )

}