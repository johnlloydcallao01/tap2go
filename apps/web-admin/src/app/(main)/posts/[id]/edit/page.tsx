'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PostEditor } from '@/components/cms/PostEditor';
import { ClientOnly } from '@/components/ClientOnly';

function EditPostSkeleton() {
  return <div className="space-y-6 py-5 px-2.5"><div className="h-8 w-48 bg-gray-200 dark:bg-[#262626] rounded animate-pulse" /><div className="h-96 bg-gray-100 dark:bg-[#171717] rounded-xl animate-pulse" /></div>;
}

function EditPostContent() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const handleSave = (_post: unknown) => {
    // Redirect to posts list
    router.push('/posts');
  };

  const handleCancel = () => {
    router.push('/posts');
  };

  return (
    <PostEditor
      postId={postId}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}

export default function EditPostPage() {
  // Pure CSR: PostEditor is a Lexical (DOM-only) editor — render post-mount only.
  return (
    <ClientOnly fallback={<EditPostSkeleton />}>
      <EditPostContent />
    </ClientOnly>
  );
}
