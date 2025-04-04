
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define an interface for Garmin credentials that matches what we're storing
interface GarminCredentials {
  id: string;
  user_id: string;
  email: string;
  password_encrypted?: string;
  normalized_email: string;
  last_sync?: string;
  created_at?: string;
  updated_at?: string;
}

const formSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function GarminConnect() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [garminConnected, setGarminConnected] = useState(false);
  const [garminCredentials, setGarminCredentials] = useState<GarminCredentials | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      loadGarminCredentials();
    }
  }, [user]);

  const loadGarminCredentials = async () => {
    try {
      // Use explicit typing with the response
      const { data, error } = await supabase
        .from('garmin_credentials')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code !== "PGRST116") { // Not found error
          console.error("Error fetching Garmin credentials:", error);
        }
        setGarminConnected(false);
        return;
      }

      if (data) {
        setGarminConnected(true);
        setGarminCredentials(data as GarminCredentials);
        form.setValue("email", data.email);
      }
    } catch (error) {
      console.error("Error loading Garmin credentials:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to connect Garmin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Normalize email for endpoints
      const normalizedEmail = values.email.replace(/[@.]/g, "").toLowerCase();

      const { error } = await supabase.functions.invoke("garmin-auth", {
        body: {
          email: values.email,
          password: values.password,
          normalized_email: normalizedEmail,
          action: "setup"
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success!",
        description: "Your Garmin account has been connected.",
      });

      setGarminConnected(true);
      await loadGarminCredentials();
    } catch (error: any) {
      console.error("Error connecting Garmin:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect your Garmin account. " + (error.message || ""),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGarmin = async () => {
    if (!user || !garminCredentials) return;

    setIsLoading(true);
    try {
      // Use direct string value with explicit type safety
      const { error } = await supabase
        .from('garmin_credentials')
        .delete()
        .eq('id', garminCredentials.id);

      if (error) throw error;

      setGarminConnected(false);
      setGarminCredentials(null);
      form.reset();

      toast({
        title: "Success!",
        description: "Your Garmin account has been disconnected.",
      });
    } catch (error: any) {
      console.error("Error disconnecting Garmin:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect your Garmin account: " + (error.message || ""),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncGarminData = async () => {
    if (!user || !garminCredentials) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("garmin-auth", {
        body: {
          normalized_email: garminCredentials.normalized_email,
          action: "sync"
        },
      });

      if (error) throw new Error(error.message);

      toast({
        title: "Sync Started",
        description: "Your Garmin data synchronization has been initiated.",
      });
    } catch (error: any) {
      console.error("Error syncing Garmin data:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync your Garmin data: " + (error.message || ""),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Garmin Connect</CardTitle>
        <CardDescription>
          Connect your Garmin account to sync activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {garminConnected ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full bg-green-400 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Connected to Garmin account: {garminCredentials?.email}
                  </p>
                  {garminCredentials?.last_sync && (
                    <p className="mt-1 text-xs text-green-700">
                      Last synced: {new Date(garminCredentials.last_sync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={syncGarminData} 
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync Garmin Data"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={disconnectGarmin}
                disabled={isLoading}
              >
                Disconnect Garmin
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@garmin.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Garmin Account"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start text-xs text-gray-500">
        <p>Your credentials are encrypted and stored securely.</p>
        <p>We only use them to sync your activities from Garmin Connect.</p>
      </CardFooter>
    </Card>
  );
}

export default GarminConnect;
