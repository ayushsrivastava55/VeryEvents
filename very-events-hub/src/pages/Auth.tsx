import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, AtSign, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWepin } from "@/contexts/WepinContext";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { user, requestCode, login, loading: authLoading } = useAuth();
  const { accounts } = useWepin();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"handleId" | "code">("handleId");

  // Form states
  const [handleId, setHandleId] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!handleId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your VeryChat handle ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await requestCode(handleId);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Failed to Send Code",
        description: error,
        variant: "destructive",
      });
    } else {
      setStep("code");
      toast({
        title: "Code Sent!",
        description: "Check your VeryChat app for the verification code.",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast({
        title: "Validation Error",
        description: "Verification code must be 6 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const walletAddress = accounts.length > 0 ? accounts[0].address : undefined;
    const { error } = await login(handleId, code, walletAddress);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to VeryEvents!",
        description: "You've successfully logged in.",
      });
      navigate("/");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
            <Ticket className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to VeryEvents</CardTitle>
            <CardDescription className="mt-2">
              Sign in with your VeryChat handle to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === "handleId" ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="handleId">VeryChat Handle ID</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="handleId"
                    type="text"
                    placeholder="your_verychat_id"
                    value={handleId}
                    onChange={(e) => setHandleId(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your VeryChat handle (e.g., ayush5 or @ayush5)
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You'll receive a code via VeryChat push notification
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 tracking-wider text-center text-lg"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Code sent to @{handleId.replace('@', '')} on VeryChat
                </p>
              </div>
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("handleId");
                    setCode("");
                  }}
                >
                  Use Different Handle
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
