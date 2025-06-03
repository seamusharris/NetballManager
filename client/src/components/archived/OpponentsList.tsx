import { useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2, Search, Phone, Mail } from 'lucide-react';
import { Opponent } from '@shared/schema';

interface OpponentsListProps {
  opponents: Opponent[];
  isLoading: boolean;
  onEdit: (opponent: Opponent) => void;
  onDelete: (id: number) => void;
}

export default function OpponentsList({ 
  opponents, 
  isLoading, 
  onEdit, 
  onDelete 
}: OpponentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  // Filter opponents based on search
  const filteredOpponents = opponents.filter(opponent => {
    const matchesSearch = 
      searchQuery === '' || 
      opponent.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opponent.primaryContact && opponent.primaryContact.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (opponent.contactInfo && opponent.contactInfo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });
  
  // Sort opponents alphabetically by team name
  const sortedOpponents = [...filteredOpponents].sort((a, b) => {
    return a.teamName.localeCompare(b.teamName);
  });
  
  const confirmDelete = (id: number) => {
    setItemToDelete(id);
  };
  
  const handleDeleteConfirmed = () => {
    if (itemToDelete !== null) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };
  
  // Determine if the contact info is an email or phone number for icon display
  const getContactType = (contactInfo: string | null) => {
    if (!contactInfo) return null;
    
    if (contactInfo.includes('@')) {
      return 'email';
    } else if (/[\d\s\-\+\(\)]+/.test(contactInfo)) {
      return 'phone';
    }
    
    return null;
  };
  
  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search opponents..."
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Opponents Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left">Team Name</TableHead>
                <TableHead className="px-6 py-3 text-left">Primary Contact</TableHead>
                <TableHead className="px-6 py-3 text-left">Contact Information</TableHead>
                <TableHead className="px-6 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sortedOpponents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No opponents found. Please add an opponent team or adjust your search.
                  </TableCell>
                </TableRow>
              ) : (
                sortedOpponents.map(opponent => (
                  <TableRow key={opponent.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{opponent.teamName}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {opponent.primaryContact || '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {opponent.contactInfo ? (
                        <div className="flex items-center">
                          {getContactType(opponent.contactInfo) === 'email' && (
                            <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          )}
                          {getContactType(opponent.contactInfo) === 'phone' && (
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          )}
                          <span>{opponent.contactInfo}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-accent hover:text-accent-dark"
                          onClick={() => onEdit(opponent)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-error hover:text-error/80"
                              onClick={() => confirmDelete(opponent.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {opponent.teamName}? This may affect games scheduled with this opponent.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={handleDeleteConfirmed}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
