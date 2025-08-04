import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertInteractionSchema, type InsertInteraction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AddInteractionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
}

export default function AddInteractionModal({ open, onOpenChange, contactId }: AddInteractionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertInteraction>({
    resolver: zodResolver(insertInteractionSchema),
    defaultValues: {
      contactId,
      type: "",
      notes: "",
    },
  });

  const createInteractionMutation = useMutation({
    mutationFn: async (data: InsertInteraction) => {
      return await apiRequest("/api/interactions", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", contactId, "interactions"] });
      toast({
        title: "Success",
        description: "Interaction added successfully",
      });
      form.reset({ contactId, type: "", notes: "" });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add interaction",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInteraction) => {
    createInteractionMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="add-interaction-description">
        <DialogHeader>
          <DialogTitle>Add Interaction</DialogTitle>
          <p id="add-interaction-description" className="text-sm text-gray-600">
            Record a new interaction with this contact.
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interaction Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-interaction-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="site_visit">Site Visit</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4}
                      placeholder="Enter interaction details..."
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-interaction-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-interaction"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createInteractionMutation.isPending}
                data-testid="button-save-interaction"
              >
                {createInteractionMutation.isPending ? "Adding..." : "Add Interaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
