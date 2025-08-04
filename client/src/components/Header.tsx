import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import AddContactModal from "./AddContactModal";
import AddLeadModal from "./AddLeadModal";
import SearchWithAutocomplete from "./SearchWithAutocomplete";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddClick = () => {
    if (title.toLowerCase().includes('lead')) {
      setShowLeadModal(true);
    } else {
      setShowContactModal(true);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100" data-testid="text-page-title">
              {title}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <SearchWithAutocomplete
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-64"
              value={searchTerm}
              onChange={setSearchTerm}
              type={title.toLowerCase().includes('lead') ? 'leads' : 'contacts'}
            />
            <ThemeToggle />
            <Button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-add"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {title.includes('Lead') ? 'Lead' : 'Contact'}
            </Button>
          </div>
        </div>
      </header>

      <AddContactModal 
        open={showContactModal} 
        onOpenChange={setShowContactModal}
      />
      
      <AddLeadModal 
        open={showLeadModal} 
        onOpenChange={setShowLeadModal}
      />
    </>
  );
}
