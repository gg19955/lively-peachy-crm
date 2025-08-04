import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import AddContactModal from "./AddContactModal";
import AddLeadModal from "./AddLeadModal";

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
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-900" data-testid="text-page-title">
              {title}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
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
