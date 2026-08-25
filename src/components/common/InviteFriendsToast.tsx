"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Check, Users, X } from "lucide-react";
import { useUserContext } from "@/store/userStore";
import { useSearchParams } from "next/navigation";
import { getInviteLink } from "@/utils/utils";

export default function InviteFriendsToast() {
  const search = useSearchParams();
  const { roomId, user } = useUserContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Simulate a delay before showing the toast
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Start animation after a brief delay
      setTimeout(() => setIsAnimating(true), 100);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = async () => {
    try {
      if (!roomId) return;
      const inviteLink = getInviteLink(roomId, user?.username);
      await navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for animation to complete before hiding
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!search.has("new")) return null;
  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-4 left-4 z-50 
        transition-all duration-500 ease-out
        transform ${
          isAnimating
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }
      `}
    >
      <Card className="w-64 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Invite Friends</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 -mt-2"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this link to invite your friends!
            </p>
            <TooltipProvider>
              <Tooltip open={isCopied}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={copyToClipboard}
                    className="w-full"
                    size="sm"
                  >
                    {isCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Invite Link
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
