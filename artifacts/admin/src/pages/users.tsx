import { useState } from "react";
import { Link } from "wouter";
import { mockUsers } from "@/data/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, MoreHorizontal, Eye, ShieldCheck, Ban, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Users() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState(mockUsers);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; action: string; userId: string | null }>({ isOpen: false, action: "", userId: null });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()) || user.phone.includes(search);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (action: string, userId: string) => {
    setConfirmDialog({ isOpen: true, action, userId });
  };

  const confirmAction = () => {
    if (confirmDialog.userId) {
      setUsers(users.map(u => {
        if (u.id === confirmDialog.userId) {
          if (confirmDialog.action === "suspend") return { ...u, status: "suspended" };
          if (confirmDialog.action === "verify") return { ...u, isVerified: true };
          if (confirmDialog.action === "delete") return { ...u, status: "pending" }; // Mock delete
        }
        return u;
      }));
    }
    setConfirmDialog({ isOpen: false, action: "", userId: null });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'suspended': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border">
          <div className="text-sm text-muted-foreground">Total Users</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="text-2xl font-bold text-green-500">{users.filter(u => u.status === 'active').length}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <div className="text-sm text-muted-foreground">Suspended</div>
          <div className="text-2xl font-bold text-red-500">{users.filter(u => u.status === 'suspended').length}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-yellow-500">{users.filter(u => u.status === 'pending').length}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex w-full md:w-1/3 items-center relative">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email or phone..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.slice(0, 10).map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        {user.name}
                        {user.isVerified && <ShieldCheck className="w-3 h-3 text-primary" />}
                      </div>
                      <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{user.phone}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{user.city}</div>
                  <div className="text-xs text-muted-foreground">{user.state}</div>
                </TableCell>
                <TableCell className="text-sm">{user.joinDate}</TableCell>
                <TableCell>
                  <div className="flex gap-2 text-xs">
                    <span title="Followers">👥 {user.followers}</span>
                    <span title="Posts">📝 {user.posts}</span>
                    <span title="Coins" className="text-yellow-500">🪙 {user.coins}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(user.status)}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <Link href={`/users/${user.id}`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" /> View Profile
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      {!user.isVerified && (
                        <DropdownMenuItem onClick={() => handleAction("verify", user.id)} className="cursor-pointer">
                          <ShieldCheck className="mr-2 h-4 w-4" /> Verify
                        </DropdownMenuItem>
                      )}
                      {user.status === 'active' ? (
                        <DropdownMenuItem onClick={() => handleAction("suspend", user.id)} className="cursor-pointer text-yellow-600">
                          <Ban className="mr-2 h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleAction("activate", user.id)} className="cursor-pointer text-green-600">
                          <ShieldCheck className="mr-2 h-4 w-4" /> Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleAction("delete", user.id)} className="cursor-pointer text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, action: "", userId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">Confirm {confirmDialog.action}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmDialog.action} this user? This action can be logged for auditing purposes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ isOpen: false, action: "", userId: null })}>Cancel</Button>
            <Button variant={confirmDialog.action === 'delete' ? 'destructive' : 'default'} onClick={confirmAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
