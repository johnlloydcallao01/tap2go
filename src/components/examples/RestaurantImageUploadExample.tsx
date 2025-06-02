'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ImageUpload from '@/components/upload/ImageUpload';
import CloudinaryImage from '@/components/CloudinaryImage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RestaurantImageUploadExampleProps {
  restaurantId: string;
  currentImageUrl?: string;
  onImageUpdate?: (newImageUrl: string) => void;
}

export default function RestaurantImageUploadExample({
  restaurantId,
  currentImageUrl,
  onImageUpdate,
}: RestaurantImageUploadExampleProps) {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleImageChange = async (newImageUrl: string, publicId?: string) => {
    if (!user || !restaurantId) return;

    try {
      setIsUpdating(true);
      
      // Update the restaurant document in Firestore
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, {
        image: newImageUrl,
        imagePublicId: publicId || '', // Store for future transformations
        updatedAt: new Date(),
      });

      setImageUrl(newImageUrl);
      onImageUpdate?.(newImageUrl);
      
      console.log('Restaurant image updated successfully');
    } catch (error) {
      console.error('Error updating restaurant image:', error);
      alert('Failed to update restaurant image. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Restaurant Image
        </h3>
        
        {/* Upload Component */}
        <div className="max-w-md">
          <ImageUpload
            value={imageUrl}
            onChange={handleImageChange}
            uploadType="restaurant"
            additionalData={{ restaurantId }}
            placeholder="Upload restaurant image"
            aspectRatio="landscape"
            disabled={isUpdating}
          />
        </div>

        {isUpdating && (
          <p className="mt-2 text-sm text-blue-600">
            Updating restaurant image...
          </p>
        )}
      </div>

      {/* Preview Section */}
      {imageUrl && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Preview (Different Sizes)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Restaurant Card Size */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Restaurant Card (400x300)
              </p>
              <CloudinaryImage
                src={imageUrl}
                alt="Restaurant card preview"
                width={400}
                height={300}
                className="rounded-lg shadow-md"
                crop="fill"
                quality="auto"
              />
            </div>

            {/* Hero Size */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Hero Image (800x600)
              </p>
              <CloudinaryImage
                src={imageUrl}
                alt="Restaurant hero preview"
                width={400} // Display smaller but source is 800x600
                height={300}
                className="rounded-lg shadow-md"
                crop="fill"
                quality="auto"
              />
            </div>

            {/* Mobile Size */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Mobile (300x200)
              </p>
              <CloudinaryImage
                src={imageUrl}
                alt="Restaurant mobile preview"
                width={300}
                height={200}
                className="rounded-lg shadow-md"
                crop="fill"
                quality="auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          How to Use in Your Components:
        </h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>1. Upload:</strong> Use the ImageUpload component for file uploads
          </p>
          <p>
            <strong>2. Display:</strong> Use CloudinaryImage component for optimized display
          </p>
          <p>
            <strong>3. Store:</strong> Save both the URL and publicId in Firestore
          </p>
          <p>
            <strong>4. Transform:</strong> Images are automatically optimized for different screen sizes
          </p>
        </div>
      </div>
    </div>
  );
}
