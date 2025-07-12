Remove maxTeams field from section form
Replacing
<old_str>
<FormField
          control={form.control}
          name="maxTeams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Teams</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={20}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 8)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
</old_str>
with
<new_str>

</new_str>
Remove maxTeams field from section form
Replacing
<old_str>
<FormField
          control={form.control}
          name="maxTeams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Teams</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={20}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 8)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
</old_str>
with
<new_str>

</new_str>
Remove maxTeams from schema validation
Replacing
<old_str>
const sectionFormSchema = z.object({
  ageGroup: z.string().min(1, 'Age group is required'),
  sectionName: z.string().min(1, 'Section name is required'),
  description: z.string().optional(),
  maxTeams: z.number().min(1).max(20).default(8),
});
</old_str>
with
<new_str>
const sectionFormSchema = z.object({
  ageGroup: z.string().min(1, 'Age group is required'),
  sectionName: z.string().min(1, 'Section name is required'),
  description: z.string().optional(),
});
</new_str>