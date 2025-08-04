import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertLeadSchema, type InsertLead, type Contact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { Search, User } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddLeadModal({ open, onOpenChange }: AddLeadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [attachments, setAttachments] = useState<string[]>([]);
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: {
      propertyAddress: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      propertyType: "house",
      stage: "inquiry",
      priority: "medium",
      timeframe: "",
      notes: "",
      attachments: [],
    },
  });

  // Search for existing contacts
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", { search: contactSearchTerm }],
    enabled: contactSearchTerm.length > 2,
  });

  // Handle contact selection for autofill
  const handleContactSelect = (contact: Contact) => {
    form.setValue("contactName", contact.name);
    form.setValue("contactEmail", contact.email || "");
    form.setValue("contactPhone", contact.phone || "");
    setContactSearchOpen(false);
    setContactSearchTerm("");
    toast({
      title: "Contact Information Filled",
      description: `Autofilled details for ${contact.name}`,
    });
  };

  const createLeadMutation = useMutation({
    mutationFn: async (data: InsertLead) => {
      return await apiRequest("/api/leads", { method: "POST", body: { ...data, attachments } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      form.reset();
      setAttachments([]);
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
        description: "Failed to create lead",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const data = await apiRequest("/api/objects/upload", { method: "POST", body: {} });
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL as string;
      setAttachments(prev => [...prev, uploadURL]);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    }
  };

  const onSubmit = (data: InsertLead) => {
    createLeadMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property Lead</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-medium text-gray-900">Contact Information</h4>
                <Popover open={contactSearchOpen} onOpenChange={setContactSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      data-testid="button-search-contact"
                    >
                      <Search className="w-3 h-3 mr-1" />
                      Search Existing Contact
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <Command>
                      <CommandInput
                        placeholder="Search contacts..."
                        value={contactSearchTerm}
                        onValueChange={setContactSearchTerm}
                        data-testid="input-contact-search"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {contactSearchTerm.length > 2 ? "No contacts found." : "Type to search contacts..."}
                        </CommandEmpty>
                        {contacts.length > 0 && (
                          <CommandGroup>
                            {contacts.slice(0, 10).map((contact) => (
                              <CommandItem
                                key={contact.id}
                                onSelect={() => handleContactSelect(contact)}
                                className="cursor-pointer"
                                data-testid={`contact-option-${contact.id}`}
                              >
                                <User className="w-4 h-4 mr-2" />
                                <div className="flex flex-col">
                                  <span className="font-medium">{contact.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {contact.email && contact.phone ? 
                                      `${contact.email} • ${contact.phone}` :
                                      contact.email || contact.phone || "No contact details"
                                    }
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter contact name" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-lead-contact-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Enter email" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-lead-contact-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="Enter phone" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-lead-contact-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="propertyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Address *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter property address" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-property-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Property Details */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Property Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-property-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="the_lively_collection">The Lively Collection</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeframe</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-timeframe">
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="select_date">Select Date</SelectItem>
                          <SelectItem value="less_than_3_months">Less than 3 months</SelectItem>
                          <SelectItem value="3_to_6_months">3 to 6 months</SelectItem>
                          <SelectItem value="6_to_12_months">6 to 12 months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Lead Status */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Lead Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Stage</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-stage">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="inquiry">Inquiry</SelectItem>
                          <SelectItem value="meeting_booked">Meeting Booked</SelectItem>
                          <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                          <SelectItem value="contract_sent">Contract Sent</SelectItem>
                          <SelectItem value="signed">Signed</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "medium"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder="Medium" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Notes and Attachments */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Additional Information</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3}
                          placeholder="Enter any additional notes about this lead..."
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Attachments</Label>
                  <ObjectUploader
                    maxNumberOfFiles={5}
                    maxFileSize={26214400}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full border-2 border-dashed border-gray-300 rounded-lg px-6 py-4 text-center hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <div className="flex flex-col items-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Click to upload files</p>
                        <p className="text-xs text-gray-500">PDF, DOC, or images up to 25MB</p>
                      </div>
                    </div>
                  </ObjectUploader>
                  
                  {attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">{attachments.length} file(s) uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-lead"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createLeadMutation.isPending}
                data-testid="button-save-lead"
              >
                {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
