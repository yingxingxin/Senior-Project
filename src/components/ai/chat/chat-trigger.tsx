'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AIChatPopup } from './chat-popup';
import { MessageCircle, Sparkles } from 'lucide-react';

/**
 * A simple trigger button component that opens the AI chat popup.
 */
export function AIChatTrigger() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="default"
            >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Chat
            </Button>
            <AIChatPopup open={open} onOpenChange={setOpen} />
        </>
    );
}

/**
 * A floating action button variant for the AI chat.
 */
export function AIChatFAB() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95"
                aria-label="Open AI Chat"
            >
                <MessageCircle className="h-6 w-6" />
            </button>
            <AIChatPopup open={open} onOpenChange={setOpen} />
        </>
    );
}
