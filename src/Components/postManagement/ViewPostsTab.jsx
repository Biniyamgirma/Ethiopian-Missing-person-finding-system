import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // For status display
import { Edit3Icon, EyeIcon } from 'lucide-react'; // Example icons

export default function ViewPostsTab({ posts, onEditPost, t }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = posts.filter(post =>
    post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${post.firstName} ${post.middleName} ${post.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'resolved': case 'closed': return 'default';
      case 'pending review': return 'secondary';
      case 'information needed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('allPostsTitle')}</h2>
        <Input
          placeholder={t('searchPostsPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('postId')}</TableHead>
              <TableHead>{t('descriptionSummary')}</TableHead>
              <TableHead>{t('descriptionSummary')}</TableHead>
              <TableHead>{t('personName')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('postedDate')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length > 0 ? filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.id}</TableCell>
                <TableCell className="max-w-xs truncate">{post.description}</TableCell>
                <TableCell>{`${post.firstName || ''} ${post.meddleName || ''}`.trim() || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(post.status)}>{post.status}</Badge>
                </TableCell>
                <TableCell>{post.postedDate}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEditPost(post)} title={t('editPostTitle')}>
                    <Edit3Icon className="h-4 w-4" />
                  </Button>
                  {/* You can add a view details button here too if needed */}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6} className="text-center">{t('noPostsFound')}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}