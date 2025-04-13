'use client'

import {useState} from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import Link from 'next/link';

export default function LoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const {login} = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(username, password);
        /// @ts-ignore
        if (success) {
            router.push('/');
        }


    }

    return (
        <Card className="w-full max-w-md mx-auto space-y-4">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Zaloguj się</CardTitle>
                <CardDescription>Podaj swoje dane, aby zalogować się na swoje konto</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="space-y-2">
                        <Label htmlFor="username">Nazwa użytkownika</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Użytkownik"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Hasło</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Hasło"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                        Zaloguj
                    </Button>

                    <p className="text-center">
                        Nie masz konta?{' '}
                        <Link href="/auth/register" className="text-blue-500 underline">
                            Zarejestruj się
                        </Link>
                    </p>

                </form>
            </CardContent>
        </Card>
    );

}
