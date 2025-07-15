import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

const DetailItem = ({ label, value }) => {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5">
      <dt className="text-sm font-medium text-gray-500">{label}:</dt>
      <dd className="text-sm text-gray-900 col-span-2">{value || '-'}</dd>
    </div>
  );
};

export default function ViewOfficerDialog({ open, onOpenChange, officerToView, t, apiBaseUrl }) { // apiBaseUrl might not be needed if officerToView.image is already a full URL
  if (!officerToView) return null;

  const fullName = `${officerToView.firstName || ''} ${officerToView.middleName || ''} ${officerToView.lastName || ''}`.replace(/\s+/g, ' ').trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('officerDetails')}: {fullName}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {t('ViewingInformationFor')} {fullName}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Basic officer image display placeholder */}
          {officerToView.image && (
            <div className="mb-4 flex justify-center">
              <img 
                src={officerToView.image} // officerToView.image should be the full URL from transformOfficerData
                alt={`${fullName}'s photo`} 
                className="h-40 w-40 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-md" />
            </div>
          )}
          <dl className="divide-y divide-gray-200">
            <DetailItem label={t('id')} value={officerToView.id} />
            <DetailItem label={t('fullName')} value={fullName} />
            <DetailItem label={t('rank')} value={officerToView.rank} />
            <DetailItem label={t('policeStation')} value={officerToView.station} />
            <DetailItem label={t('status')} value={officerToView.status} />
            <DetailItem label={t('joinDate')} value={officerToView.joinDate} />
            <DetailItem label={t('phoneNumber')} value={officerToView.phoneNumber} />
            <DetailItem label={t('gender')} value={officerToView.gender} />
            <DetailItem label={t('birthDate')} value={officerToView.birthDate} />
            {/* we can add more details as needed */}
          </dl>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}