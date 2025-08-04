import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Edit, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Interaction, User, type Contact } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import AddInteractionModal from "./AddInteractionModal";
import EditContactModal from "./EditContactModal";

interface ContactDetailProps {
  contactId: string | null;
}

export default function ContactDetail({ contactId }: ContactDetailProps) {
  const { toast } = useToast();
  const [showAddNote, setShowAddNote] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);

  const { data: contact } = useQuery<Contact>({
    queryKey: ["/api/contacts", contactId],
    enabled: !!contactId,
  });

  const { data: interactions = [], isLoading: interactionsLoading } = useQuery<Interaction[]>({
    queryKey: ["/api/contacts", contactId, "interactions"],
    enabled: !!contactId,
  });

  if (!contactId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Select a contact to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "phone":
        return "📞";
      case "email":
        return "📧";
      case "meeting":
        return "🤝";
      case "site_visit":
        return "📍";
      default:
        return "💬";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contact Details</CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEditContact(true)}
                data-testid="button-edit-contact"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowAddNote(true)}
                data-testid="button-add-note"
              >
                Add Note
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {contact ? (
            <div>
              {/* Contact Info */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-2xl">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100" data-testid="text-contact-detail-name">
                    {contact.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400" data-testid="text-contact-detail-company">
                    {contact.company || "No company"}
                  </p>
                  <div className="mt-2 space-y-1">
                    {contact.email && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Mail className="w-4 h-4 mr-2" />
                        <span data-testid="text-contact-detail-email">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="w-4 h-4 mr-2" />
                        <span data-testid="text-contact-detail-phone">{contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Timeline */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Interaction Timeline</h5>
                
                {interactionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex space-x-3 animate-pulse">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : interactions && interactions.length > 0 ? (
                  <div className="space-y-4">
                    {interactions.map((interaction: Interaction & { user: User }) => (
                      <div key={interaction.id} className="flex space-x-3" data-testid={`interaction-${interaction.id}`}>
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">
                              {getInteractionIcon(interaction.type)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {interaction.type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {interaction.createdAt ? new Date(interaction.createdAt).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                          {interaction.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              {interaction.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            by {interaction.user.firstName} {interaction.user.lastName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No interactions recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-pulse">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddInteractionModal
        open={showAddNote}
        onOpenChange={setShowAddNote}
        contactId={contactId}
      />
      
      <EditContactModal
        open={showEditContact}
        onOpenChange={setShowEditContact}
        contact={contact}
      />
    </>
  );
}
