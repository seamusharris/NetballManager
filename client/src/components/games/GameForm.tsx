import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertGameSchema } from "@shared/schema";
import { Button } from '../ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { useClub } from '../../contexts/ClubContext';

const formSchema = insertGameSchema.extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  round: z.string().optional(),
  statusId: z.string().min(1, "Game status is required"),
  seasonId: z.string().min(1, "Season is required"),
  homeTeamId: z.string().min(1, "Home team is required"),
  awayTeamId: z.string().min(1, "Away team is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface GameFormProps {
  game?: any;
  seasons: any[];
  gameStatuses: any[];
  teams: any[];
  allTeams: any[];
  activeSeason: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export default function GameForm({
  game,
  seasons,
  gameStatuses,
  teams,
  allTeams = [],
  activeSeason,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}: GameFormProps) {
  const { toast } = useToast();
  const { currentClubId } = useClub();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      time: "",
      round: "",
      statusId: activeSeason ? "1" : "",
      seasonId: activeSeason ? activeSeason.id.toString() : "",
      homeTeamId: "",
      awayTeamId: "",
    },
  });

  console.log("GameForm useEffect triggered:", {
    game: game ? { id: game.id, statusId: game.statusId, homeTeamId: game.homeTeamId } : null,
    activeSeason: activeSeason ? { id: activeSeason.id, name: activeSeason.name } : null,
    gameStatuses: gameStatuses?.length || 0,
    teams: teams?.length || 0,
  });

  useEffect(() => {
    if (game && activeSeason) {
      console.log("Resetting form with game data:", game);
      form.reset({
        date: game.date || "",
        time: game.time || "",
        round: game.round || "",
        statusId: game.statusId?.toString() || "1",
        seasonId: game.seasonId?.toString() || activeSeason.id.toString(),
        homeTeamId: game.homeTeamId?.toString() || "",
        awayTeamId: game.awayTeamId?.toString() || "",
      });
    } else if (activeSeason && !game) {
      // Set defaults for new games
      form.reset({
        date: "",
        time: "",
        round: "",
        statusId: "1",
        seasonId: activeSeason.id.toString(),
        homeTeamId: "",
        awayTeamId: "",
      });
    }
  }, [game, activeSeason, form]);

  const formValues = form.watch();
  console.log("GameForm rendering with data:", {
    gameStatuses: gameStatuses?.length || 0,
    teams: teams?.length || 0,
    seasons: seasons?.length || 0,
    isEditing,
    formValues: {
      date: formValues.date,
      time: formValues.time,
      round: formValues.round,
      statusId: formValues.statusId,
      seasonId: formValues.seasonId,
      homeTeamId: formValues.homeTeamId,
      awayTeamId: formValues.awayTeamId,
    },
  });

  const handleSubmit = (values: FormValues) => {
    // Validate required fields
    if (!values.homeTeamId) {
      form.setError("homeTeamId", { message: "Please select a home team" });
      return;
    }
    if (!values.awayTeamId) {
      form.setError("awayTeamId", { message: "Please select an away team" });
      return;
    }

    const gameData = {
      date: values.date,
      time: values.time,
      round: values.round,
      statusId: parseInt(values.statusId),
      seasonId: parseInt(values.seasonId),
      homeTeamId: parseInt(values.homeTeamId),
      awayTeamId: parseInt(values.awayTeamId),
    };

    if (isEditing && game) {
      console.log("Updating game with ID:", game.id, "and data:", gameData);
    } else {
      console.log("Creating new game with data:", gameData);
    }

    onSubmit(gameData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                    type="number" 
                    min="1" 
                    placeholder="Enter round number"
                    {...field}
                  />
                </FormControl>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {seasons.map(season => (
                      <SelectItem key={season.id} value={season.id.toString()}>
                        {season.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Which season this game belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="homeTeamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Home Team</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams && teams.length > 0 ? (
                      teams.map(team => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="">Loading teams...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The home team for this game
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams && teams.length > 0 ? (
                      teams.map(team => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="">Loading teams...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The away team for this game
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select game status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gameStatuses && gameStatuses.length > 0 ? (
                      gameStatuses.map(status => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.displayName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="1">Loading statuses...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Current status of the game
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Game" : "Create Game"}
          </Button>
        </div>
      </form>
    </Form>
  );
}