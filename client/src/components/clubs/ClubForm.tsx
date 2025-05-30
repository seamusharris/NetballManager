
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const clubSchema = z.object({
  name: z.string().min(1, "Club name is required").max(100, "Name must be 100 characters or less"),
  code: z.string().min(1, "Club code is required").max(10, "Code must be 10 characters or less").regex(/^[A-Z0-9]+$/, "Code must contain only uppercase letters and numbers"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  address: z.string().max(200, "Address must be 200 characters or less").optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactPhone: z.string().max(20, "Phone must be 20 characters or less").optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").default("#1f2937"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").default("#ffffff"),
});

type ClubFormData = z.infer<typeof clubSchema>;

interface Club {
  id: number;
  name: string;
  code: string;
  description?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface ClubFormProps {
  club?: Club;
  onSubmit: (data: ClubFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export default function ClubForm({ 
  club, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: ClubFormProps) {
  const form = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: club?.name || "",
      code: club?.code || "",
      description: club?.description || "",
      address: club?.address || "",
      contactEmail: club?.contactEmail || "",
      contactPhone: club?.contactPhone || "",
      primaryColor: club?.primaryColor || "#1f2937",
      secondaryColor: club?.secondaryColor || "#ffffff",
    },
  });

  const handleSubmit = (data: ClubFormData) => {
    console.log("Submitting club data:", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Club Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Emeralds Netball Club"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Club Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., ENC"
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-gray-500">
                A short code to identify the club (uppercase letters and numbers only)
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Optional description of the club..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Club address (optional)..."
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="club@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input 
                    type="tel"
                    placeholder="+61 4XX XXX XXX"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color"
                      className="w-12 h-10 p-1 border"
                      {...field}
                    />
                    <Input 
                      type="text"
                      placeholder="#1f2937"
                      className="flex-1"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color"
                      className="w-12 h-10 p-1 border"
                      {...field}
                    />
                    <Input 
                      type="text"
                      placeholder="#ffffff"
                      className="flex-1"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (club ? "Updating..." : "Creating...") : (club ? "Update Club" : "Create Club")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
