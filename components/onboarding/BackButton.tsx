'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/src/lib/utils';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label = 'Back', className }: BackButtonProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          'text-white/70 hover:text-white hover:bg-white/10 transition-all',
          className
        )}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}