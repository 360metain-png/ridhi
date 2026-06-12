import { useState } from "react";
import { mockCommunities } from "@/data/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Ban, Trash2, CheckCircle, Download} from "lucide-react";
import { downloadCSV } from "@/lib/utils";

export default function Communities() {
  const [search, setSearch] = useState("");

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
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("communities_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border">
          <div className="text-sm text-muted-foreground">Total Communities</div>
          <div className="text-2xl font-bold">{mockCommunities.length}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="text-2xl font-bold text-green-500">{mockCommunities.filter(c => c.status === 'active').length}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <div className="text-sm text-muted-foreground">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-500">{mockCommunities.filter(c => c.status === 'pending').length}</div>
        </div>
      </div>

      <div className="flex items-center relative w-full md:w-1/3">
        <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
        <Input 
          placeholder="Search communities..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Community Name</TableHead>
              <TableHead>Category & Language</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCommunities.slice(0, 10).map((community) => (
              <TableRow key={community.id}>
                <TableCell className="font-medium">{community.name}</TableCell>
                <TableCell>
                  <div className="text-sm">{community.category}</div>
                  <div className="text-xs text-muted-foreground">{community.language}</div>
                </TableCell>
                <TableCell>{community.members.toLocaleString()}</TableCell>
                <TableCell>{community.posts.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={community.visibility === 'public' ? '' : 'bg-muted'}>
                    {community.visibility.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(community.status)}>
                    {community.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="View"><Eye className="w-4 h-4" /></Button>
                    {community.status === 'pending' && <Button variant="ghost" size="icon" className="text-green-500" title="Approve"><CheckCircle className="w-4 h-4" /></Button>}
                    {community.status === 'active' && <Button variant="ghost" size="icon" className="text-yellow-600" title="Suspend"><Ban className="w-4 h-4" /></Button>}
                    <Button variant="ghost" size="icon" className="text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
