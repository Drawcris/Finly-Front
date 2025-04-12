'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import axiosInstance from "@/lib/axios";
import Link from 'next/link';



export default function RegisterForm() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !email || !password || !password2) {
            setError('Wszystkie pola są wymagane.');
            return;
        }

        if (password !== password2) {
            setError('Hasła do siebie nie pasują.');
            return;
        }

        try {
            await axiosInstance.post('/register/', {
                first_name: firstName,
                last_name: lastName,
                username,
                email,
                password,
                password2
            });
            router.push('/auth/login');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const responseMessage = error.response?.data?.message || 'Coś poszło nie tak.';
                setError(responseMessage);
            } else {
                setError('Nie udało się połączyć z serwerem.');
            }
            // @ts-ignore
            console.error('Błąd rejestracji:', error.response?.data); // Debugowanie
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto space-y-4">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Zarejestruj się</CardTitle>
                <CardDescription>
                    Utwórz konto, podając wszystkie wymagane dane
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="space-y-2">
                        <Label htmlFor="firstName">Imię</Label>
                        <Input
                            id="firstName"
                            type="text"
                            placeholder="Twoje imię"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Nazwisko</Label>
                        <Input
                            id="lastName"
                            type="text"
                            placeholder="Twoje nazwisko"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Nazwa użytkownika</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Nazwa użytkownika"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Powtórz hasło</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Powtórz hasło"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                        Zarejestruj się
                    </Button>

                    <p className="text-center">
                        Masz już konto?{' '}
                        <Link href="/auth/login" className="text-blue-500 underline">
                            Zaloguj się
                        </Link>
                    </p>

                </form>
            </CardContent>
        </Card>
    );
}