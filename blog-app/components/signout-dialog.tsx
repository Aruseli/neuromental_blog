'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { signOut } from "next-auth/react";
import { useState } from "react";

export const SignOutDialog = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
  };
  return (<Dialog>
    <DialogTrigger>Выйти</DialogTrigger>
    <DialogContent>
      <DialogHeader className="sm:text-center">
        <DialogTitle className='text-base'>Выход из системы</DialogTitle>
        <DialogDescription>
          <div className='flex-col items-center'>
            <div className="text-center text-sm mb-4">
              Вы уверены, что хотите выйти?
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Выполняется выход...' : 'Выйти из системы'}
            </button>
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>);
};