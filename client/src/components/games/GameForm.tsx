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
import { insertGameSchema, Game, Opponent, Season } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";

// Game statuses and teams interfaces
interface GameStatus {
  id: number;
  name: string;
  displayName: string;
  points: number;
  opponentPoints: number;
  isCompleted: boolean;
  allowsStatistics: boolean;
  requiresOpponent: boolean;
  colorClass: string;
  sortOrder: number;
  isActive: boolean;
}

interface Team {
  id: number;
  name: string;
  division?: string;
  clubId: number;
}

// Extend the schema for the form validation
const formSchema = insertGameSchema.extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  opponentId: z.string().min(1, "Opponent is required"),
  round: z.string().optional(),
  statusId: z.string().min(1, "Game status is required"),
  seasonId: z.string().min(1, "Season is required"),
  homeTeamId: z.string().min(1, "Home team is required"),
  awayTeamId: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface GameFormProps {
  game?: Game;
  opponents: Opponent[];
  seasons: Season[];
  activeSeason?: Season;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function GameForm({ 
  game, 
  opponents, 
  seasons, 
  activeSeason, 
  onSubmit, 
  isSubmitting, 
  onCancel 
}: GameFormProps) {
  const isEditing = !!game;

  // Fetch game statuses
  const { data: gameStatuses = [], isLoading: statusesLoading } = useQuery<GameStatus[]>({
    queryKey: ['game-statuses'],
    queryFn: () => apiRequest('GET', '/api/game-statuses') as Promise<GameStatus[]>,
  });

  // Fetch teams
  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => apiRequest('GET', '/api/teams') as Promise<Team[]>,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: game?.date || "",
      time: game?.time || "",
      opponentId: game?.opponentId ? String(game.opponentId) : "",
      round: game?.round || "",
      statusId: game?.statusId ? String(game.statusId) : "1",
      seasonId: game?.seasonId ? String(game.seasonId) : activeSeason ? String(activeSeason.id) : "",
      homeTeamId: game?.homeTeamId ? String(game.homeTeamId) : "",
      awayTeamId: game?.awayTeamId ? String(game.awayTeamId) : "none"
    },
  });

  const handleSubmit = (values: FormValues) => {
    // Validate required fields
    if (!values.opponentId) {
      form.setError("opponentId", { message: "Please select an opponent" });
      return;
    }
    if (!values.homeTeamId) {
      form.setError("homeTeamId", { message: "Please select a home team" });
      return;
    }
    if (!values.seasonId) {
      form.setError("seasonId", { message: "Please select a season" });
      return;
    }

    const formattedValues = {
      date: values.date,
      time: values.time,
      round: values.round,
      opponentId: parseInt(values.opponentId),
      statusId: parseInt(values.statusId),
      seasonId: parseInt(values.seasonId),
      homeTeamId: parseInt(values.homeTeamId),
      awayTeamId: values.awayTeamId && values.awayTeamId !== "none" ? parseInt(values.awayTeamId) : null
    };

    onSubmit(formattedValues);
  };

  if (statusesLoading || teamsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="homeTeamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Home Team</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="relative z-50 max-h-96 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-white text-gray-900 shadow-lg"
                    sideOffset={4}
                    align="start"
                  >
                    {teams.map(team => (
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
                <Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} value={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select away team (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="relative z-50 max-h-96 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-white text-gray-900 shadow-lg"
                    sideOffset={4}
                    align="start"
                  >
                    <SelectItem value="none">No away team</SelectItem>
                    {teams.map(team => (
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
              <FormLabel required>Opponent</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select opponent" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="relative z-50 max-h-96 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-white text-gray-900 shadow-lg"
                    sideOffset={4}
                    align="start"
                  >
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
                <FormLabel required>Date</FormLabel>
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
                <FormLabel required>Time</FormLabel>
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
                Specify the round number in the season
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
              <FormLabel required>Game Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select game status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="relative z-50 max-h-96 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-white text-gray-900 shadow-lg"
                    sideOffset={4}
                    align="start"
                  >
                    {gameStatuses.filter(s => s.isActive).map(status => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.displayName}
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
              <FormLabel required>Season</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="relative z-50 max-h-96 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-white text-gray-900 shadow-lg"
                    sideOffset={4}
                    align="start"
                  >
                    {seasons.map(season => (
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

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Game' : 'Schedule Game'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default GameForm;