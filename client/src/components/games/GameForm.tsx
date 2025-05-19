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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { insertGameSchema, Game, Opponent } from "@shared/schema";

// Extend the schema for the form validation
const formSchema = insertGameSchema.extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  opponentId: z.string(), // No validation directly on the field
  completed: z.boolean().default(false),
  isBye: z.boolean().default(false)
}).refine(
  (data) => {
    // If it's a bye, we don't need opponent
    if (data.isBye) return true;
    // If not a bye, opponent is required
    return data.opponentId !== "";
  },
  {
    message: "Opponent is required unless it's a BYE round",
    path: ["opponentId"]
  }
);

// Convert string opponentId to number for submission
type FormValues = z.infer<typeof formSchema> & {
  opponentId: string;
};

interface GameFormProps {
  game?: Game;
  opponents: Opponent[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function GameForm({ game, opponents, onSubmit, isSubmitting }: GameFormProps) {
  const isEditing = !!game;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: game?.date || "",
      time: game?.time || "",
      opponentId: game?.opponentId ? String(game.opponentId) : "",
      completed: game?.completed || false,
      isBye: game?.isBye || false
    },
  });
  
  const handleSubmit = (values: FormValues) => {
    // For BYE games, we may not have an opponentId
    const formattedValues = {
      ...values,
      // Only convert opponentId to number if it's provided
      opponentId: values.opponentId ? parseInt(values.opponentId) : null
    };
    
    onSubmit(formattedValues);
  };
  
  return (
    <Form {...form}>
      <h2 className="text-xl font-bold mb-6">{isEditing ? "Edit Game" : "Schedule New Game"}</h2>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="isBye"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>BYE Round</FormLabel>
                <FormDescription>
                  Mark as BYE if your team doesn't have a scheduled match this round
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    // If BYE is checked, clear opponent field
                    if (checked) {
                      form.setValue("opponentId", "");
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="opponentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opponent</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={form.watch("isBye")}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={form.watch("isBye") ? "Not required for BYE" : "Select opponent"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {opponents.map(opponent => (
                    <SelectItem key={opponent.id} value={opponent.id.toString()}>
                      {opponent.teamName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {form.watch("isBye") 
                  ? "No opponent needed for BYE rounds" 
                  : "Select the team your squad will be playing against"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        

        
        <FormField
          control={form.control}
          name="completed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Game Status</FormLabel>
                <FormDescription>
                  {form.watch("isBye") 
                    ? "Mark as completed to include in season stats" 
                    : "Mark as completed to enter statistics for this game"}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" className="bg-primary text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Game' : 'Schedule Game'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
