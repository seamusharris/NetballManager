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
import { insertGameSchema, Game, Opponent, Season, Team } from "@shared/schema";
import { useGameStatuses } from "@/hooks/use-game-statuses";
import { useTeams } from "@/hooks/use-teams";

// Extend the schema for the form validation
const formSchema = insertGameSchema.extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  opponentId: z.string(), // No validation directly on the field
  round: z.string().optional(),
  statusId: z.string().optional(), // Use statusId instead of status
  seasonId: z.string().optional(), // Season ID as string for form handling
  homeTeamId: z.string(), // Team ID as string for form handling
  awayTeamId: z.string().optional() // Away team ID as string for form handling
}).refine(
  (data) => {
    // For regular games, either opponent or away team is required
    return (data.opponentId !== "none" && data.opponentId !== "") || (data.awayTeamId !== "none" && data.awayTeamId !== "");
  },
  {
    message: "Either opponent or away team is required",
    path: ["opponentId"]
  }
);

// Convert string fields to numbers for submission
type FormValues = z.infer<typeof formSchema> & {
  opponentId: string;
  statusId: string;
  seasonId: string;
  homeTeamId: string;
  awayTeamId: string;
};

interface GameFormProps {
  game?: Game;
  opponents: Opponent[];
  seasons: Season[];
  activeSeason?: Season;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function GameForm({ game, opponents, seasons, activeSeason, onSubmit, isSubmitting, onCancel }: GameFormProps) {
  const isEditing = !!game;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: game?.date || "",
      time: game?.time || "",
      opponentId: game?.opponentId ? String(game.opponentId) : "none",
      round: game?.round || "",
      statusId: game?.statusId ? String(game.statusId) : "1", // Default to first status (usually "upcoming")
      seasonId: game?.seasonId ? String(game.seasonId) : activeSeason ? String(activeSeason.id) : "",
      homeTeamId: game?.homeTeamId ? String(game.homeTeamId) : "",
      awayTeamId: game?.awayTeamId ? String(game.awayTeamId) : "none"
    },
  });

  const handleSubmit = (values: FormValues) => {
    // Format the values for submission
    const formattedValues = {
      date: values.date,
      time: values.time,
      round: values.round,
      opponentId: (values.opponentId && values.opponentId !== "none") ? parseInt(values.opponentId) : null,
      statusId: parseInt(values.statusId),
      seasonId: values.seasonId ? parseInt(values.seasonId) : (activeSeason ? activeSeason.id : undefined),
      homeTeamId: parseInt(values.homeTeamId),
      awayTeamId: (values.awayTeamId && values.awayTeamId !== "none") ? parseInt(values.awayTeamId) : null
    };

    console.log("Submitting game with statusId:", formattedValues);
    onSubmit(formattedValues);

    // Close the form after submitting if onCancel is provided
    if (onCancel) {
      onCancel();
    }
  };

  const { data: allGameStatuses } = useGameStatuses();
  const { data: teams } = useTeams();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="homeTeamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Home Team *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  required
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams?.map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the team playing at home
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="awayTeamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Away Team</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No away team (vs opponent)</SelectItem>
                    {teams?.map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select away team for inter-club games
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="opponentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opponent *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select opponent" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Select an opponent...</SelectItem>
                  {opponents.map(opponent => (
                    <SelectItem key={opponent.id} value={opponent.id.toString()}>
                      {opponent.teamName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the team your squad will be playing against
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
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} required />
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
                <FormLabel>Time *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} required />
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
          name="statusId"
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
                  {allGameStatuses?.filter(s => s.isActive).map(statusObj => (
                    <SelectItem key={statusObj.id} value={statusObj.id.toString()}>
                      {statusObj.displayName}
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

        <div className="flex justify-end space-x-2 mt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="bg-primary text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Game' : 'Schedule Game'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default GameForm;