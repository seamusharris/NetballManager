import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertOpponentSchema, Opponent } from "@shared/schema";

// Extend the schema for the form validation
const formSchema = insertOpponentSchema;

type FormValues = z.infer<typeof formSchema>;

interface OpponentFormProps {
  opponent?: Opponent;
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
}

export default function OpponentForm({ opponent, onSubmit, isSubmitting }: OpponentFormProps) {
  const isEditing = !!opponent;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: opponent?.teamName || "",
      primaryContact: opponent?.primaryContact || "",
      contactInfo: opponent?.contactInfo || "",
    },
  });
  
  return (
    <Form {...form}>
      <h2 className="text-xl font-bold mb-6">{isEditing ? "Edit Opponent" : "Add New Opponent"}</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="teamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Thunder Netball" {...field} />
              </FormControl>
              <FormDescription>
                Enter the name of the opposing team
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="primaryContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Contact</FormLabel>
              <FormControl>
                <Input placeholder="Jane Smith" {...field} />
              </FormControl>
              <FormDescription>
                The main contact person for this team (e.g., coach, manager)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Information</FormLabel>
              <FormControl>
                <Input placeholder="example@email.com or phone number" {...field} />
              </FormControl>
              <FormDescription>
                Email address or phone number for the primary contact
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" className="bg-primary text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Opponent' : 'Add Opponent'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
