import { useState } from "react";
import { mockPosts } from "@/data/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Trash2, AlertTriangle, EyeOff } from "lucide-react";

export default function ContentModeration() {
  const [posts, setPosts] = useState(mockPosts.filter(p => p.reports > 0 || p.status === 'flagged'));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Content Moderation</h1>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="reel">Reels</SelectItem>
            <SelectItem value="story">Stories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="removed">Removed</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6 space-y-4">
          {posts.slice(0, 5).map(post => (
            <Card key={post.id} className="overflow-hidden border-red-500/20">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0 border-b sm:border-b-0 sm:border-r">
                  <span className="text-muted-foreground uppercase text-xs tracking-wider">{post.type} Media</span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">User: {post.userId}</div>
                        <div className="text-sm text-muted-foreground">{post.createdAt}</div>
                      </div>
                      <Badge variant="destructive" className="flex gap-1 items-center">
                        <AlertTriangle className="w-3 h-3" /> {post.reports} Reports
                      </Badge>
                    </div>
                    <p className="text-sm mt-2">{post.content}</p>
                    <div className="text-xs text-muted-foreground mt-4">
                      Reason: Inappropriate content / Spam
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4 mr-1" /> Remove
                    </Button>
                    <Button size="sm" variant="outline" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                      <AlertTriangle className="w-4 h-4 mr-1" /> Warn User
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
