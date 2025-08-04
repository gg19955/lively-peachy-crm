import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lead, insertLeadSchema } from "@shared/schema";
import { z } from "zod";

const updateLeadSchema = insertLeadSchema.partial().extend({
  id: z.string(),
});

type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

interface EditLeadModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditLeadModal({ lead, open, onOpenChange }: EditLeadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateLeadInput>({
    resolver: zodResolver(updateLeadSchema),
    values: lead ? {
      id: lead.id,
      propertyAddress: lead.propertyAddress || "",
      contactName: lead.contactName || "",
      contactEmail: lead.contactEmail || "",
      contactPhone: lead.contactPhone || "",
      stage: lead.stage,
      priority: lead.priority,
      estimatedValue: lead.estimatedValue || undefined,
      notes: lead.notes || "",
    } : undefined,
  });

  const updateLeadMutation = useMutation({
    mutationFn: (data: UpdateLeadInput) => apiRequest({
      url: `/api/leads/${data.id}`,
      method: "PATCH",
      body: data,
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/by-stage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (leadId: string) => apiRequest({
      url: `/api/leads/${leadId}`,
      method: "DELETE",
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/by-stage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    updateLeadMutation.mutate(data);
  });

  const handleDelete = () => {
    if (lead && confirm("Are you sure you want to delete this lead?")) {
      deleteLeadMutation.mutate(lead.id);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-edit-lead">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Property Address</Label>
            <Input
              id="propertyAddress"
              {...form.register("propertyAddress")}
              placeholder="Enter property address"
              data-testid="input-property-address"
            />
            {form.formState.errors.propertyAddress && (
              <p className="text-sm text-red-600">
                {form.formState.errors.propertyAddress.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                {...form.register("contactName")}
                placeholder="Contact name"
                data-testid="input-contact-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                {...form.register("contactEmail")}
                placeholder="contact@example.com"
                data-testid="input-contact-email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                {...form.register("contactPhone")}
                placeholder="Phone number"
                data-testid="input-contact-phone"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value</Label>
              <Input
                id="estimatedValue"
                type="number"
                {...form.register("estimatedValue", { valueAsNumber: true })}
                placeholder="0"
                data-testid="input-estimated-value"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={form.watch("stage") || ""}
                onValueChange={(value) => form.setValue("stage", value as any)}
              >
                <SelectTrigger data-testid="select-stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inquiry">New Leads</SelectItem>
                  <SelectItem value="meeting_booked">Meeting Booked</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.watch("priority") || ""}
                onValueChange={(value) => form.setValue("priority", value as any)}
              >
                <SelectTrigger data-testid="select-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional notes..."
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLeadMutation.isPending}
              data-testid="button-delete-lead"
            >
              {deleteLeadMutation.isPending ? "Deleting..." : "Delete Lead"}
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateLeadMutation.isPending}
                data-testid="button-save-lead"
              >
                {updateLeadMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}