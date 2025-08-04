import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Contact } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ContactsListProps {
  onSelectContact: (contactId: string | null) => void;
  selectedContactId: string | null;
}

export default function ContactsList({ onSelectContact, selectedContactId }: ContactsListProps) {
  const { toast } = useToast();
  const [contactType, setContactType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const CONTACTS_PER_PAGE = 5;
  
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const allFilteredContacts = contacts
    ?.filter((contact: Contact) => 
      contactType === "all" || contact.type === contactType
    )
    ?.sort((a: Contact, b: Contact) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) || [];

  const totalPages = Math.ceil(allFilteredContacts.length / CONTACTS_PER_PAGE);
  const startIndex = currentPage * CONTACTS_PER_PAGE;
  const filteredContacts = allFilteredContacts.slice(startIndex, startIndex + CONTACTS_PER_PAGE);

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "follow-up":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatLastContact = (updatedAt: string) => {
    const date = new Date(updatedAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Contacts</CardTitle>
          <div className="flex items-center space-x-3">
            <Select value={contactType} onValueChange={(value) => {
              setContactType(value);
              setCurrentPage(0); // Reset to first page when filter changes
            }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tenant">Tenants</SelectItem>
                <SelectItem value="landlord">Landlords</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="prospect">Prospects</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No contacts found
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact: Contact) => (
                      <tr
                        key={contact.id}
                        className={cn(
                          "hover:bg-gray-50 cursor-pointer transition-colors",
                          selectedContactId === contact.id && "bg-blue-50"
                        )}
                        onClick={() => onSelectContact(contact.id)}
                        data-testid={`row-contact-${contact.id}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900" data-testid={`text-contact-name-${contact.id}`}>
                                {contact.name}
                              </div>
                              <div className="text-sm text-gray-500" data-testid={`text-contact-email-${contact.id}`}>
                                {contact.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900" data-testid={`text-contact-company-${contact.id}`}>
                            {contact.company || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900" data-testid={`text-contact-last-contact-${contact.id}`}>
                            {formatLastContact(contact.updatedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={cn(
                              "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                              getStatusColor(contact.status || "active")
                            )}
                            data-testid={`status-contact-${contact.id}`}
                          >
                            {contact.status || "Active"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing {startIndex + 1}-{Math.min(startIndex + CONTACTS_PER_PAGE, allFilteredContacts.length)} of {allFilteredContacts.length} results
                </p>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!canGoPrevious}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    data-testid="button-previous-contacts"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!canGoNext}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    data-testid="button-next-contacts"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
