import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, ChevronLeft, ChevronRight, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const CONTACTS_PER_PAGE = 5;
  
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const allFilteredContacts = contacts
    ?.filter((contact: Contact) => {
      const matchesType = contactType === "all" || contact.type === contactType;
      const matchesSearch = !searchTerm || 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    })
    ?.sort((a: Contact, b: Contact) => {
      const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bDate - aDate;
    }) || [];

  const totalPages = Math.ceil(allFilteredContacts.length / CONTACTS_PER_PAGE);
  const startIndex = currentPage * CONTACTS_PER_PAGE;
  const filteredContacts = allFilteredContacts.slice(startIndex, startIndex + CONTACTS_PER_PAGE);

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "follow-up":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatLastContact = (updatedAt: string | Date) => {
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
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
          <CardTitle className="text-lg sm:text-xl">Recent Contacts</CardTitle>
          <div className="flex items-center space-x-3">
            <Select value={contactType} onValueChange={(value) => {
              setContactType(value);
              setCurrentPage(0); // Reset to first page when filter changes
            }}>
              <SelectTrigger className="w-32 sm:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="real_estate_professional">Real Estate Professional</SelectItem>
                <SelectItem value="builder_developer">Builder / Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="business_owner">Business Owner</SelectItem>
                <SelectItem value="content_creator">Content Creator</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="property_owner">Property Owner</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search bar for contacts */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search contacts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0); // Reset to first page when search changes
            }}
            data-testid="input-search-contacts"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile-first responsive layout */}
            <div className="block sm:hidden">
              {/* Mobile card layout */}
              <div className="space-y-3 px-4">
                {filteredContacts.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No contacts found
                  </div>
                ) : (
                  filteredContacts.map((contact: Contact) => (
                    <div
                      key={contact.id}
                      className={cn(
                        "p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-colors",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        selectedContactId === contact.id && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => onSelectContact(contact.id)}
                      data-testid={`contact-card-${contact.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {contact.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {contact.company || '-'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatLastContact(contact.updatedAt || contact.createdAt || new Date())}
                          </p>
                        </div>
                        <span className={cn("px-2 py-1 text-xs rounded-full", getStatusColor(contact.status))}>
                          {contact.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Desktop table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No contacts found
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact: Contact) => (
                      <tr
                        key={contact.id}
                        className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors",
                          selectedContactId === contact.id && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                        onClick={() => onSelectContact(contact.id)}
                        data-testid={`row-contact-${contact.id}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid={`text-contact-name-${contact.id}`}>
                                {contact.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400" data-testid={`text-contact-email-${contact.id}`}>
                                {contact.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100" data-testid={`text-contact-company-${contact.id}`}>
                            {contact.company || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100" data-testid={`text-contact-last-contact-${contact.id}`}>
                            {contact.updatedAt ? formatLastContact(contact.updatedAt) : 'No date'}
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
            
            <div className="px-3 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                  Showing {startIndex + 1}-{Math.min(startIndex + CONTACTS_PER_PAGE, allFilteredContacts.length)} of {allFilteredContacts.length} results
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!canGoPrevious}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    data-testid="button-previous-contacts"
                    className="flex-1 sm:flex-none"
                  >
                    <ChevronLeft className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!canGoNext}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    data-testid="button-next-contacts"
                    className="flex-1 sm:flex-none"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4 sm:ml-1" />
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
