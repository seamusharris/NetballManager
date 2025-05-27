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
import { insertGameSchema, Game, Opponent, Season } from "@shared/schema";
import { useGameStatuses } from "@/hooks/use-game-statuses";

// Extend the schema for the form validation
const formSchema = insertGameSchema.extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  opponentId: z.string(), // No validation directly on the field
  round: z.string().optional(),
  status: z.string().optional(),
  seasonId: z.string().optional() // Season ID as string for form handling
}).refine(
  (data) => {
    // If it's a bye or abandoned, we don't need opponent
    if (data.status === 'bye' || data.status === 'abandoned') return true;
    // For regular games, opponent is required
    return data.opponentId !== "";
  },
  {
    message: "Opponent is required unless it's a BYE round or abandoned game",
    path: ["opponentId"]
  }
);

// Convert string opponentId to number for submission
type FormValues = z.infer<typeof formSchema> & {
  opponentId: string;
  seasonId: string;
};

interface GameFormProps {
  game?: Game;
  opponents: Opponent[];
  seasons: Season[];
  activeSeason?: Season;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function GameForm({ game, opponents, seasons, activeSeason, onSubmit, isSubmitting }: GameFormProps) {
  const isEditing = !!game;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: game?.date || "",
      time: game?.time || "",
      opponentId: game?.opponentId ? String(game.opponentId) : "",
      round: game?.round || "",
      status: game?.status || "upcoming",
      seasonId: game?.seasonId ? String(game.seasonId) : activeSeason ? String(activeSeason.id) : ""
    },
  });

  const handleSubmit = (values: FormValues) => {
    // Special handling for BYE and abandoned games - they don't need an opponent
    if (values.status === 'bye' || values.status === 'abandoned') {
      const specialGameData = {
        date: values.date,
        time: values.time,
        round: values.round,
        status: values.status,
        opponentId: null,
        seasonId: values.seasonId ? parseInt(values.seasonId) : (activeSeason ? activeSeason.id : undefined)
      };

      console.log("Submitting special game:", specialGameData);
      onSubmit(specialGameData);
      return;
    }

    // Regular games need an opponent
    const formattedValues = {
      date: values.date,
      time: values.time,
      round: values.round,
      opponentId: parseInt(values.opponentId),
      status: values.status || 'upcoming',
      seasonId: values.seasonId ? parseInt(values.seasonId) : (activeSeason ? activeSeason.id : undefined)
    };

    console.log("Submitting regular game:", formattedValues);
    onSubmit(formattedValues);
  };

  const { data: allGameStatuses } = useGameStatuses();

  return (
    <Form {...form}>
      <h2 className="text-xl font-bold mb-6">{isEditing ? "Edit Game" : "Schedule New Game"}</h2>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="opponentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opponent</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={form.watch("status") === 'bye' || form.watch("status") === 'abandoned'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      form.watch("status") === 'bye' ? "Not required for BYE" :
                      form.watch("status") === 'abandoned' ? "Not required for abandoned games" :
                      "Select opponent"
                    } />
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
                {form.watch("status") === 'bye' 
                  ? "No opponent needed for BYE rounds" 
                  : form.watch("status") === 'abandoned'
                  ? "No opponent needed for abandoned games"
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
          name="round"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Round</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter round number (e.g., 1, 2, SF, GF)" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Specify the round number in the season, or special values like "SF" for semi-finals or "GF" for grand final
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select game status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allGameStatuses?.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Set the current status of this game
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seasonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Season</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seasons && seasons.map(season => (
                    <SelectItem key={season.id} value={season.id.toString()}>
                      {season.name} {season.isActive && '(Active)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select which season this game belongs to
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Game' : 'Schedule Game'}
          </Button>
        </div>
      </form>
    </Form>
  );
}