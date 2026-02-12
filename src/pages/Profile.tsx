import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { User, MapPin, Phone, Mail, Lock, Loader2, Camera, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast as sonnerToast } from "sonner";

const Profile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [sending2FA, setSending2FA] = useState(false);
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [show2FAInput, setShow2FAInput] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profile Updated", description: "Your profile has been saved." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ full_name: fullName, phone });
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ address, city });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password Changed", description: "Your password has been updated." });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" });
      return;
    }
    const { data: publicUrl } = supabase.storage.from("profile-avatars").getPublicUrl(path);
    updateProfile.mutate({ avatar_url: publicUrl.publicUrl });
  };

  const handleSend2FACode = async () => {
    setSending2FA(true);
    try {
      const { error } = await supabase.functions.invoke("send-2fa-code", {
        body: { action: "generate" },
      });
      if (error) throw error;
      setShow2FAInput(true);
      sonnerToast.success("Verification code sent to your email");
    } catch {
      sonnerToast.error("Failed to send verification code");
    } finally {
      setSending2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    setVerifying2FA(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-2fa-code", {
        body: { action: "verify", code: twoFactorCode },
      });
      if (error) throw error;
      if (data?.verified) {
        sonnerToast.success("Two-factor authentication enabled!");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        setShow2FAInput(false);
        setTwoFactorCode("");
      } else {
        sonnerToast.error(data?.error || "Invalid code");
      }
    } catch {
      sonnerToast.error("Verification failed");
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      const { error } = await supabase.functions.invoke("send-2fa-code", {
        body: { action: "toggle", enabled: false },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      sonnerToast.success("Two-factor authentication disabled");
    } catch {
      sonnerToast.error("Failed to disable 2FA");
    }
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 shadow-card h-fit">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    className="absolute bottom-3 right-0 bg-primary text-primary-foreground rounded-full p-1.5 hover:opacity-90"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <h2 className="text-xl font-bold mb-1">{fullName || "User"}</h2>
                <p className="text-sm text-muted-foreground mb-2">{email}</p>
                {profile?.two_factor_enabled && (
                  <Badge className="bg-success text-success-foreground"><Shield className="h-3 w-3 mr-1" />2FA Enabled</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="2fa">2FA</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle>
                    <CardDescription>Update your personal details here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSavePersonal} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" />Email</Label>
                        <Input id="email" type="email" value={email} disabled className="opacity-60" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" />Phone Number</Label>
                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 912 345 6789" />
                      </div>
                      <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="address">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Delivery Address</CardTitle>
                    <CardDescription>Manage your delivery address</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Session Road" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Baguio City" />
                      </div>
                      <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? "Saving..." : "Save Address"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Security Settings</CardTitle>
                    <CardDescription>Update your password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </div>
                      <Button type="submit" className="w-full">Change Password</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="2fa">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Two-Factor Authentication</CardTitle>
                    <CardDescription>Add extra security to your account with email-based 2FA</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile?.two_factor_enabled ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                          <Shield className="h-5 w-5 text-success" />
                          <div>
                            <p className="font-medium">2FA is enabled</p>
                            <p className="text-sm text-muted-foreground">Your account is protected with email verification codes</p>
                          </div>
                        </div>
                        <Button variant="destructive" onClick={handleDisable2FA}>Disable 2FA</Button>
                      </div>
                    ) : show2FAInput ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your email:</p>
                        <Input
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleVerify2FA} disabled={verifying2FA || twoFactorCode.length !== 6} className="flex-1">
                            {verifying2FA ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Verify & Enable
                          </Button>
                          <Button variant="outline" onClick={() => { setShow2FAInput(false); setTwoFactorCode(""); }}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Enable two-factor authentication to add an extra layer of security. We'll send a verification code to your email when you sign in.
                        </p>
                        <Button onClick={handleSend2FACode} disabled={sending2FA}>
                          {sending2FA ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                          Enable 2FA
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
