import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Contact, Lead } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SearchWithAutocompleteProps {
  placeholder: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  type: 'contacts' | 'leads';
}

interface SearchSuggestion {
  id: string;
  name: string;
  type: 'contact' | 'lead';
  subtitle?: string;
}

export default function SearchWithAutocomplete({ 
  placeholder, 
  className, 
  value, 
  onChange, 
  type 
}: SearchWithAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch data for autocomplete
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: type === 'contacts' || value.length > 0,
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: type === 'leads' || value.length > 0,
  });

  // Generate suggestions based on search term
  const suggestions: SearchSuggestion[] = value.length > 0 ? (() => {
    const searchTerm = value.toLowerCase();
    const results: SearchSuggestion[] = [];

    // Add contact suggestions
    if (type === 'contacts' || contacts.length > 0) {
      contacts
        .filter(contact => 
          contact.name.toLowerCase().includes(searchTerm) ||
          contact.email?.toLowerCase().includes(searchTerm) ||
          contact.company?.toLowerCase().includes(searchTerm)
        )
        .slice(0, 3)
        .forEach(contact => {
          results.push({
            id: contact.id,
            name: contact.name,
            type: 'contact',
            subtitle: contact.company || contact.email || undefined,
          });
        });
    }

    // Add lead suggestions
    if (type === 'leads' || leads.length > 0) {
      leads
        .filter(lead =>
          lead.propertyAddress?.toLowerCase().includes(searchTerm) ||
          lead.contactName?.toLowerCase().includes(searchTerm)
        )
        .slice(0, 3)
        .forEach(lead => {
          results.push({
            id: lead.id,
            name: lead.propertyAddress || 'Unknown Property',
            type: 'lead',
            subtitle: lead.contactName || undefined,
          });
        });
    }

    return results.slice(0, 6); // Limit to 6 total suggestions
  })() : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex];
          onChange(suggestion.name);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="pl-10"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(e.target.value.length > 0);
          setSelectedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(value.length > 0)}
        data-testid="input-search-autocomplete"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id}`}
              ref={el => suggestionRefs.current[index] = el}
              className={cn(
                "px-4 py-3 cursor-pointer transition-colors",
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                selectedIndex === index && "bg-gray-100 dark:bg-gray-700"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
              data-testid={`suggestion-${suggestion.type}-${suggestion.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {suggestion.name}
                  </p>
                  {suggestion.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {suggestion.subtitle}
                    </p>
                  )}
                </div>
                <span className={cn(
                  "ml-2 px-2 py-1 text-xs rounded-full",
                  suggestion.type === 'contact' 
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                )}>
                  {suggestion.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}