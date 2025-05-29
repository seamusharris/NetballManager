
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
});

type ClubFormData = z.infer<typeof clubSchema>;

interface Club {
  id: number;
  name: string;
  code: string;
  description?: string;
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
