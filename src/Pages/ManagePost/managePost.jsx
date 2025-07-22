import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from '@/hooks/useTranslation';
import AddNewPostTab from '@/components/postManagement/AddNewPostTab';
import ViewPostsTab from '@/components/postManagement/ViewPostsTab';
import EditPostDialog from '@/components/postManagement/EditPostDialog';

// Mock initial posts data - in a real app, this would come from an API
const initialPostsData = [
  {
    id: "",
    region: "",
    zone: "",
    town: "",
    subCity: "",
    description: "",
    firstName: "",
    middleName: "",
    lastName: "",
    age: 30,
    lastLocation: "",
    gender: "",
    officerId: "",
    stationId: "",
    status: "",
    image: "", // Placeholder filename
    postedDate: "",
    addToZoneTable: false,
    addToRegionTable: false,
    addToCountryTable: false,
  }
];

export default function ManagePostPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState(initialPostsData);
  const [activeTab, setActiveTab] = useState("viewPosts");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  const handleAddNewPost = (newPostData) => {
    const newPostWithId = {
      ...newPostData,
      id: `POST${String(posts.length + 1).padStart(3, '0')}`, // Simple ID generation
      postedDate: new Date().toISOString().split('T')[0], // Current date
      // Initialize escalation flags
      addToZoneTable: false,
      addToRegionTable: false,
      addToCountryTable: false,
    };
    setPosts(prevPosts => [newPostWithId, ...prevPosts]);
    setActiveTab("viewPosts"); // Switch to view posts tab after adding
    // In a real app, you'd likely send this to a backend API
  };

  const handleEditPost = (post) => {
    setPostToEdit(post);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePost = (updatedPostData) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === updatedPostData.id ? updatedPostData : post
      )
    );
    setIsEditDialogOpen(false);
    setPostToEdit(null);
    // In a real app, you'd send this update to a backend API
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('postManagementTitle')}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mb-6">
          <TabsTrigger value="addNewPost">{t('addNewPostTab')}</TabsTrigger>
          <TabsTrigger value="viewPosts">{t('viewPostsTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="addNewPost">
          <AddNewPostTab onAddPost={handleAddNewPost} t={t} />
        </TabsContent>

        <TabsContent value="viewPosts">
          <ViewPostsTab posts={posts} onEditPost={handleEditPost} t={t} />
        </TabsContent>
      </Tabs>

      {postToEdit && (
        <EditPostDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          postToEdit={postToEdit}
          onUpdatePost={handleUpdatePost}
          t={t}
        />
      )}
    </div>
  );
}