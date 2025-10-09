'use client'

import React, { useEffect } from 'react'
import { toast } from 'sonner'

const GeospatialSyncNotification: React.FC = () => {
  useEffect(() => {
    const handleFormSubmit = async () => {
      // Wait for the form submission to complete
      setTimeout(async () => {
        try {
          // Get the current URL to extract the merchant ID
          const currentUrl = window.location.pathname
          const merchantIdMatch = currentUrl.match(/\/merchants\/([^\/]+)/)
          
          if (!merchantIdMatch) {
            console.log('Could not extract merchant ID from URL')
            return
          }
          
          const merchantId = merchantIdMatch[1]
          
          // Fetch the updated merchant document
          const response = await fetch(`https://cms.tap2goph.com/api/merchants/${merchantId}`)
          const merchant = await response.json()
          
          // Check if geospatial fields are populated
          if (merchant.merchant_latitude && merchant.merchant_longitude && merchant.merchant_coordinates) {
            toast.success('Geospatial fields filled successfully!')
          } else {
            toast.error('Failed to fill geospatial fields. Please check the address.')
          }
        } catch (error) {
          console.error('Error checking geospatial sync:', error)
          toast.error('Error checking geospatial sync status.')
        }
      }, 2000) // Wait 2 seconds for the backend to process
    }

    // Listen for form submission events
    const handleSubmit = (event: Event) => {
      const target = event.target as HTMLElement
      if (target.closest('form')) {
        handleFormSubmit()
      }
    }

    // Add event listener for form submissions
    document.addEventListener('submit', handleSubmit)

    return () => {
      document.removeEventListener('submit', handleSubmit)
    }
  }, [])

  return null // This component doesn't render anything visible
}

export default GeospatialSyncNotification