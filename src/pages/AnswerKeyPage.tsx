import React from 'react';
import { AnswerKeyForm } from '../components/AnswerKeyForm';
import { MasterAnswerKey } from '../types';

interface AnswerKeyPageProps {
  activeKey: MasterAnswerKey | null;
  savedKeys: MasterAnswerKey[];
  onSaveKey: (key: MasterAnswerKey) => void;
  onSelectKey: (key: MasterAnswerKey) => void;
  onOpenPrintModal?: () => void;
}

export const AnswerKeyPage: React.FC<AnswerKeyPageProps> = ({
  activeKey,
  savedKeys,
  onSaveKey,
  onSelectKey,
  onOpenPrintModal,
}) => {
  return (
    <div>
      <AnswerKeyForm
        initialKey={activeKey}
        savedKeys={savedKeys}
        onSave={onSaveKey}
        onSelectKey={onSelectKey}
        onOpenPrintModal={onOpenPrintModal}
      />
    </div>
  );
};
